RPG MV의 병렬 이벤트의 세부 관리 및 최적화를 지원하는 플러그인

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
 * 1. 병렬 처리 이벤트 최적화 - 1프레임마다 이벤트 호출 -> n프레임마다 이벤트 호출 (딜레이 커스텀 가능)
 * 1-1. 특정 이벤트의 딜레이 커스텀
 *      <ParallelDelay:해당 이벤트의 딜레이 타임 or 딜레이 타임들>
 *          ex 1) <ParallelDelay:60>
 *          ex 2) <ParallelDelay:60,22,16>  // 모든 IsParallelFrame에서 사용하는 딜레이 타임들
 * 1-2. n프레임마다 실행할 특정 이벤트 코드 커스텀
 *      (이벤트 페이지 내 현재 프레임 카운트 반환 함수(조건식으로 사용) 방식)
 *      ex ) 조건분기 → 스크립트 → NMHN.PPM.isParallelFrame(this, 60)
 * 
 * (※) 현재 버전에선 공용 이벤트의 경우, '커먼 이벤트 탭에서 직접 "병렬 처리" 트리거 설정'는 로직 미적용
