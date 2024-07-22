import React, { useEffect, useState } from 'react';
import './App.css';

//! 만약 checkClear가 모두 true라면 "you win!!"

function App() {
  const [cardArr, setCardArr] = useState<string[]>([]); // 카드 배열
  const [compareCard, setCompareCard] = useState<{ name: string; idx: number }[]>([]); // 선택한 카드 2개 값 비교
  const [checkClear, setCheckClear] = useState(new Array(16).fill(false)); // 클리어 여부
  const [complateCard, setComplateCard] = useState<string[]>([]); // 클리어된 카드들 저장
  const startTime = 10;
  const [playTime, setPlayTime] = useState<number>(startTime); // 플레이 시간 초
  const [isPlayStart, setIsPlayStart] = useState<boolean>(false); // 게임 시작 여부

  const makeCard = () => {
    const arr = ['일', '이', '삼', '사', '오', '육', '칠', '팔'];
    arr.push(...arr);
    arr.sort(() => Math.random() - 0.5);
    setCardArr(arr);
  };

  // 선택한 카드의 몬스터 이름과 인덱스를 저장
  const handleSelectCard = (item: string, idx: number) => {
    // 게임이 스타트가 되지않으면 카드를 선택할 수 없음.
    if (!isPlayStart) return;
    // 선택한 카드가 2개가 될때까지 추가
    if (compareCard.length < 2) {
      setCompareCard((prevData) => [...prevData, { name: item, idx: idx }]);
    }

    // 선택한 카드 true로 값변경 (선택한 카드를 모두 active)
    setCheckClear((prevData) => {
      const data = [...prevData];
      data[idx] = true;
      return data;
    });
  };

  // settimeout promise
  const wait = (timeToDelay: number) => new Promise((resolve) => setTimeout(resolve, timeToDelay));

  // 두개의 값 대조
  const compareCardValue = async () => {
    if (compareCard.length !== 2) return;

    const [card1, card2] = compareCard;

    if (card1.name === card2.name) {
      setComplateCard((prev: string[]) => [...prev, card1.name]);
    } else {
      await wait(500); // 카드 보여지는 시간
      setCheckClear((prev) => {
        let data = [...prev];
        data[card1.idx] = complateCard.includes(card1.name);
        data[card2.idx] = complateCard.includes(card2.name);
        return data;
      });
    }
    setCompareCard([]);
  };

  // 페이지 로드후에 카드가 앞면이 보여졌다가. 뒷면으로 전체 뒤집혀야한다.
  const handleFlipCard = async () => {
    setCheckClear(new Array(16).fill(true));
    await wait(2000); // 카드 외울 시간
    setCheckClear(new Array(16).fill(false));
    await wait(300); // 애니메이션 0.3s
    setIsPlayStart(true); // 게임시작
    setPlayTime(startTime); // 플레이타임 시간
  };

  // 타이머
  useEffect(() => {
    const timer = setInterval(() => {
      // start 버튼이 클릭되고 클리어 타임이 0초가 아니라면
      if (isPlayStart && playTime > 0) {
        setPlayTime((prev) => prev - 1);
      } else {
        // 클리어 타임이 0초라면 게임종료
        clearInterval(timer);
        setIsPlayStart(false);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isPlayStart, playTime]);

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
      <h2>제한시간 40초 안에 같은 그림의 카드를 짝지어주세요</h2>
      <p>
        Play Time : <span>{playTime}</span> 초
      </p>
      <div className="card-container">
        {playTime === 0 && <div className="game-over">Game Over</div>}

        <ul>
          {cardArr.map((item, idx) => (
            <li key={idx} onClick={() => handleSelectCard(item, idx)} className={checkClear[idx] ? 'active' : ''}>
              <div className="card-back">{item}</div>
            </li>
          ))}
        </ul>
      </div>
      <button type="button" onClick={handleFlipCard}>
        Start
      </button>
    </div>
  );
}

export default App;
