//=============================================================================
// NMHN_ParallelProcessM.js
//=============================================================================

/*:ko
 * @plugindesc 병렬 처리 이벤트 매니저
 * @author 뉴문하나
 * 
 * @param Event Update Delay
 * @type number
 * @desc 모든 병렬 처리 이벤트에 기본으로 넣을 호출 딜레이. 0 이하일 시 수동 딜레이 비활성화
 * @default 10
 * 
 * @param ---Common Event---
 * @default
 * 
 * @param CommonEventDelays
 * @parent ---Common Event---
 * @text 공통 이벤트 딜레이 목록
 * @type struct<CommonEventDelay>[]
 * @desc 개별 딜레이를 지정할 공통 이벤트 목록
 * @default []
 *
 * @help
 * 용도 및 사용법
 * RPG MV의 병렬 이벤트의 세부 관리 및 최적화를 지원하는 플러그인.
 * 
 * (1) 병렬 처리 이벤트 최적화 - 1프레임마다 이벤트 호출 -> n프레임마다 이벤트 호출 (딜레이 커스텀 가능)
 * ㅁ 특정 맵 이벤트 딜레이 커스텀
 *  - <ParallelDelay:해당 이벤트의 딜레이 타임 or 딜레이 타임들>
 *   - ex 1) <ParallelDelay:60>
 *   - ex 2) <ParallelDelay:60,22,16>  // 모든 IsParallelFrame에서 사용하는 딜레이 타임들
 * ㅁ 특정 공통 이벤트 딜레이 커스텀
 *  - CommonEventDelays 파라미터에 '공동 이벤트 / 딜레이 타임 or 딜레이 타임들' 등록
 * ㅁ n프레임마다 실행할 특정 이벤트 코드 커스텀
 *  - (이벤트 페이지 내 현재 프레임 카운트 반환 함수(조건식으로 사용) 방식)
 *   - ex ) 조건분기 → 스크립트 → NMHN.PPM.isParallelFrame(this, 60)
 * 
 * 
 * 
 * ============================================================================
 * 사용 약관
 * ============================================================================
 * 
 * MIT 라이센스
 * 크레딧에 'Newmoonhana'(또는 '뉴문하나') 표기 필수
 *  - 필수라고 적긴 했지만 사실 안했다고 제가 머리를 깨러 찾아가지는 않습니다. 다만 저는 명성을 원합니다.
 * 비상업적, 상업적 사용 가능, 편집 가능
 * 기능 편집이 전혀 없는 원본 그대로의 파일을 판매 금지 (우우우 쌀쌀쌀)
 * 
 * ============================================================================
 * Changelog
 * ============================================================================
 * Version 1.00:
 * - 플러그인 완성
 * 
 */
// ==================================================
/*~struct~CommonEventDelay:ko
 * @param commonEventId
 * @text 공통 이벤트
 * @type common_event
 * @desc 딜레이를 적용할 공통 이벤트 (병렬 처리 트리거)
 * @default 0
 *
 * @param delays
 * @text 딜레이 값
 * @type string
 * @desc 프레임 딜레이. 여러 개 입력 시 콤마로 구분(최대공약수 적용) ex) 60,22,16
 * @default 10
 */


var NMHN = NMHN || {};
NMHN.PPM = NMHN.PPM || {};

(function () {
    function gcd(a, b) {    //최대공약수
        return b === 0 ? a : gcd(b, a % b);
    }

    //=============================================================================
    // Parameter Variables
    //=============================================================================
    var Params = PluginManager.parameters('NMHN_ParallelProcessM');
    NMHN.PPM.eventUpdateDelay = JSON.parse(Params['Event Update Delay']);

    // 공통 이벤트별 딜레이 맵(map 파일 말고 자료구조 map) 구성
    NMHN.PPM.commonEventDelayMap = {};
    (function() {
        const rawList = JSON.parse(Params['CommonEventDelays'] || '[]');
        rawList.forEach(function(str) {
            const obj = JSON.parse(str);
            const id = Number(obj.commonEventId);
            const nums = String(obj.delays)
                .split(',')
                .map(s => Number(s.trim()))
                .filter(n => !isNaN(n) && n > 0);
            NMHN.PPM.commonEventDelayMap[id] = nums.length > 0
                ? nums.reduce((a, b) => gcd(a, b))
                : NMHN.PPM.eventUpdateDelay;
        });
    })();
    // =========================================================================
    // 유틸
    // =========================================================================
    // 업데이트 딜레이 - 현재 프레임 체크
    Game_Event.prototype.isParallelFrame = function(n) {
        return this._parallelFrameCount % n === 0;
    };
    NMHN.PPM.isParallelFrame = function(interpreter, n) {
        const event = $gameMap.event(interpreter._eventId) || interpreter._parallelCommonEvent;
        return event ? event.isParallelFrame(n) : false;
    };

    // 공통 이벤트 호출(자식 인터프리터) 시에도 소유자 참조가 이어지도록 전파
    const _Game_Interpreter_setupChild = Game_Interpreter.prototype.setupChild;
    Game_Interpreter.prototype.setupChild = function(list, eventId) {
        _Game_Interpreter_setupChild.call(this, list, eventId);
        if (this._parallelCommonEvent) {
            this._childInterpreter._parallelCommonEvent = this._parallelCommonEvent;
        }
    };
    
    // =========================================================================
    // 맵 병렬 이벤트 업데이트 딜레이
    // =========================================================================
    const _Game_Event_initMembers = Game_Event.prototype.initMembers;
    Game_Event.prototype.initMembers = function() {
        _Game_Event_initMembers.call(this);
        this._parallelFrameCount = 0;
    };

    // 이벤트 페이지 마지막에 대기 이벤트 추가 or 조건분기 괄호 닫기 직전 대기 이벤트 추가
    NMHN.PPM.Game_Event_updateParallel = Game_Event.prototype.updateParallel;
    Game_Event.prototype.updateParallel = function() {
        if (this._interpreter) {
            if (!this._interpreter.isRunning()) {
                const delay = this.parallelDelay();
                // Wait이 실제로 delay프레임만큼 대기했으므로 그만큼 누적
                this._parallelFrameCount += delay > 0 ? delay : 1;
                this._interpreter.setup(this.parallelList(), this._eventId);
            }
            this._interpreter.update();
        }
    };
    Game_Event.prototype.parallelList = function() {
        const list = this.list();
        const delay = this.parallelDelay();
        if (delay > 0) {
            const waitCommand = { code: 230, indent: 0, parameters: [delay] };
            return list.concat([waitCommand]);
        }
        return list;
    };

    // 이벤트 노트 파싱
    // ex 1) <ParallelDelay:60>
    // ex 2) <ParallelDelay:60,22,16>
    Game_Event.prototype.parallelDelay = function() {
        if (this._parallelDelay === undefined) {
            const note = this.event().note || '';
            const match = note.match(/<ParallelDelay:\s*([\d,\s]+)>/i);
            if (match) {
                const nums = match[1]
                    .split(',')
                    .map(s => Number(s.trim()))
                    .filter(n => !isNaN(n) && n > 0);
                this._parallelDelay = nums.length > 0 ? nums.reduce((a, b) => gcd(a, b)) : NMHN.PPM.eventUpdateDelay;
            } else {
                this._parallelDelay = NMHN.PPM.eventUpdateDelay;
            }
        }
        return this._parallelDelay;
    };

    // =========================================================================
    // 공통 이벤트 병렬 이벤트 업데이트 딜레이
    // =========================================================================
    const _Game_CommonEvent_initialize = Game_CommonEvent.prototype.initialize;
    Game_CommonEvent.prototype.initialize = function(commonEventId) {
        this._parallelFrameCount = 0;
        _Game_CommonEvent_initialize.call(this, commonEventId);
    };

    Game_CommonEvent.prototype.isParallelFrame = function(n) {
        return this._parallelFrameCount % n === 0;
    };

    Game_CommonEvent.prototype.parallelDelay = function() {
        if (this._parallelDelay === undefined) {
            const mapped = NMHN.PPM.commonEventDelayMap[this._commonEventId];
            this._parallelDelay = mapped !== undefined ? mapped : NMHN.PPM.eventUpdateDelay;
        }
        return this._parallelDelay;
    };

    NMHN.PPM.Game_CommonEvent_list = Game_CommonEvent.prototype.list;
    Game_CommonEvent.prototype.list = function() {
        const delay = this.parallelDelay();
        if (delay <= 0) {
            return NMHN.PPM.Game_CommonEvent_list.call(this);
        }
        this._parallelFrameCount += delay;
        if (this._interpreter) {
            this._interpreter._parallelCommonEvent = this;
        }
        const list = NMHN.PPM.Game_CommonEvent_list.call(this);
        const waitCommand = { code: 230, indent: 0, parameters: [delay] };
        return list.concat([waitCommand]);
    };
})();
