(() => {
  const $$ = (ele) => Array.from(document.querySelectorAll(ele));
  const $ = (ele) => (el) => ele.querySelector(el);

  const addClassDelay = (element, className, delay) => {
    setTimeout(() => {
      element.classList.add(className);
    }, delay);
  };

  // 배열을 렌덤으로 섞는 함수 (Fisher-Yates 알고리즘)
  const randem = (array) => {
    for(let i = array.length - 1; i > 0; i--){
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
  };

  const boxes = $$('.sec_inner .box');
  randem(boxes); //active 클래스를 랜덤하게 삽입 함으로써 슬라이드 효과를 랜덤하게 준다.

  boxes.map((el, idx) => {
    addClassDelay(el, 'active', idx * 200);
    addClassDelay($(el)('.list_box'), 'active', idx * 200);
    addClassDelay($(el)('.back_box'), 'active', idx * 200);
    addClassDelay($(el)('.thumb_img'), 'active', idx * 200);
  });

})();