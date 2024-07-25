import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [cardArr, setCardArr] = useState<string[]>([]); // 카드 배열
  const [compareCard, setCompareCard] = useState<{ name: string; idx: number }[]>([]); // 선택한 카드 2개 값 비교
  const [checkClear, setCheckClear] = useState(new Array(16).fill(false)); // 클리어 여부
  const [complateCard, setComplateCard] = useState<string[]>([]); // 클리어된 카드들 저장
  const startTime = 40;
  const [playTime, setPlayTime] = useState<number>(startTime); // 플레이 시간 초
  const [isPlayStart, setIsPlayStart] = useState<boolean>(false); // 게임 시작 여부

  // 카드 섞기
  const makeCard = () => {
    const arr = ['1', '2', '3', '4', '5', '6', '7', '8'];
    arr.push(...arr);
    arr.sort(() => Math.random() - 0.5);
    setCardArr(arr);
  };

  // 선택한 카드와 인덱스를 저장
  const handleSelectCard = (item: string, idx: number) => {
    // 게임이 스타트가 되지않으면 카드를 선택할 수 없음.
    if (!isPlayStart) return;
    // 선택한 카드가 2개가 될때까지 추가
    if (compareCard.length < 2) {
      setCompareCard((prevData) => [...prevData, { name: item, idx: idx }]);
    }

    // 선택한 카드 true로 값변경 (선택한 카드의 숫자를 일단 보여줌)
    setCheckClear((prevData) => {
      const data = [...prevData];
      data[idx] = true;
      return data;
    });
  };

  // settimeout promise
  const wait = (timeToDelay: number) => new Promise((resolve) => setTimeout(resolve, timeToDelay));

  // 2개의 카드 값 비교
  const compareCardValue = async () => {
    // 카드를 2개를 고르지 않았다면 비교할 필요가 없으므로 아래 코드를 실행시키지 않음.
    if (compareCard.length !== 2) return;

    // 2개의 카드 값을 구조분해할당으로 가독성 높임.
    const [card1, card2] = compareCard;

    // 2개의 카드를 비교하여 서로 같은 값으로 일치한다면
    if (card1.name === card2.name) {
      // 클리어된 카드가 아닌 경우만 클리어가 완료된 카드 배열에 추가
      if (!complateCard.includes(card1.name)) {
        setComplateCard((prev: string[]) => [...prev, card1.name]);
      }
    } else {
      // 2개의 카드가 값이 일치하지 않는다면 다시 카드를 뒤집어야 한다.
      // 카드가 바로 뒷면으로 뒤집히면 무슨 카드인지 볼 수 없으므로 뒤집히는 시간을 지연시킨다.
      await wait(500); // 카드 보여지는 시간
      // 클리어가 완료된 카드배열에서 선택한 2개의 카드값이 포함되어 있는지 확인
      // 포함되어있는 카드는 계속 앞면을 유지하고, 아닌 카드만 뒷면으로 뒤집어준다.
      setCheckClear((prev) => {
        let data = [...prev];
        data[card1.idx] = complateCard.includes(card1.name);
        data[card2.idx] = complateCard.includes(card2.name);
        return data;
      });
    }
    // 선택한 2개의 카드값 비교 배열을 초기화 시킨다.
    setCompareCard([]);
  };

  // 카드가 앞면이 보여졌다가. 뒷면으로 전체 뒤집혀야한다.
  const handleFlipCard = async () => {
    setComplateCard([]); // 클리어 배열 초기화
    makeCard(); // 카드섞기
    setPlayTime(startTime); // 플레이타임 시간

    setCheckClear(new Array(16).fill(true));
    await wait(2000); // 카드 외울 시간
    setCheckClear(new Array(16).fill(false));
    await wait(300); // 카드 뒤집히는 시간 (애니메이션 0.3s)

    setIsPlayStart(true); // 게임시작 (타이머 스타트)
  };

  // 타이머
  useEffect(() => {
    // 모두 클리어라면 타이머 중지.
    if (complateCard.length === cardArr.length / 2) {
      setIsPlayStart(false);
      return;
    }
    const timer = setInterval(() => {
      // start 버튼이 클릭되고 클리어 타임이 0초가 아니라면 시간초 감소
      if (isPlayStart && playTime > 0) {
        setPlayTime((prev) => prev - 1);
      } else {
        // 클리어 타임이 0초라면 게임종료
        clearInterval(timer);
        setIsPlayStart(false);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isPlayStart, playTime, complateCard]);

  // 선택한 2개의 카드를 비교한다.
  useEffect(() => {
    compareCardValue();
  }, [compareCard, checkClear]);

  // 카드를 랜덤으로 섞는다.
  useEffect(() => {
    makeCard();
  }, []);

  return (
    <div className="App">
      <h2>제한시간 40초 안에 같은 숫자의 카드를 짝지어주세요</h2>
      <p>
        Play Time : <span>{playTime}</span> 초
      </p>
      <div className="card-container">
        <ul>
          {cardArr.map((item, idx) => (
            <li key={idx} onClick={() => handleSelectCard(item, idx)} className={checkClear[idx] ? 'active' : ''}>
              <div className="card-back">{item}</div>
            </li>
          ))}
        </ul>
        {/* 시간이 0초 인경우 게임오버 */}
        {playTime === 0 && <div className="game-over">Game Over</div>}
        {/* 모든 문제를 다 맞춘 경우 */}
        {complateCard.length === cardArr.length / 2 && <div className="game-over">You Win!!</div>}
      </div>
      {!isPlayStart && (
        <button type="button" onClick={handleFlipCard}>
          Start
        </button>
      )}
    </div>
  );
}

export default App;
