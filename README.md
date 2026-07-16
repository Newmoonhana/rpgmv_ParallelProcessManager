RPG MV의 병렬 이벤트의 세부 관리 및 최적화를 지원하는 플러그인

 * (1) 병렬 처리 이벤트 최적화 - 1프레임마다 이벤트 호출 -> n프레임마다 이벤트 호출 (딜레이 커스텀 가능)
 * ㅁ 특정 맵 이벤트 딜레이 커스텀
 *  - <ParallelDelay:해당 이벤트의 딜레이 타임 or 딜레이 타임들>
 *   - ex 1) <ParallelDelay:60>
 *   - ex 2) <ParallelDelay:60,22,16>  // 모든 IsParallelFrame에서 사용하는 딜레이 타임들
     - <img width="410" height="100" alt="image" src="https://github.com/user-attachments/assets/c8249242-4ad9-467e-b371-a8ecfa2c31e5" />
     10프레임마다 병렬 이벤트 페이지 호출 예시
 * ㅁ 특정 공통 이벤트 딜레이 커스텀
 *  - CommonEventDelays 파라미터에 '공동 이벤트 / 딜레이 타임 or 딜레이 타임들' 등록
    - <img width="368" height="166" alt="image" src="https://github.com/user-attachments/assets/ead89600-b2ca-4999-ac13-4fae11620a3b" />
    1번 병렬 공통 이벤트(드롭 박스에서 선택)를 10프레임마다 호출 예시, (기존 병렬 공통 이벤트 설정 방법처럼) 병렬 스위치 설정 필요
 * ㅁ n프레임마다 실행할 특정 이벤트 코드 커스텀
 *  - (이벤트 페이지 내 현재 프레임 카운트 반환 함수(조건식으로 사용) 방식)
 *   - ex ) 조건분기 → 스크립트 → NMHN.PPM.isParallelFrame(this, 60)
     - <img width="476" height="412" alt="image" src="https://github.com/user-attachments/assets/97b39194-7a62-48a3-a541-b1afbeadb25a" />
     60프레임마다 특정 이벤트 코드 호출 시 조건 분기 설정 예시
 * 
 * ==============================================================
 * 사용 약관
 * ==============================================================
 * 
 * MIT 라이센스
 * 크레딧에 'Newmoonhana'(또는 '뉴문하나') 표기 필수
 *  - 필수라고 적긴 했지만 사실 안했다고 제가 머리를 깨러 찾아가지는 않습니다. 다만 저는 명성을 원합니다.
 * 비상업적, 상업적 사용 가능, 편집 가능
 * 기능 편집이 전혀 없는 원본 그대로의 파일을 판매 금지 (우우우 쌀쌀쌀)
