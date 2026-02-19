import { chromium } from 'playwright';

(async () => {
  // 브라우저 실행
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('티스토리 글쓰기 페이지로 다시 이동합니다...');
  // 글쓰기 직접 URL (새 에디터)
  await page.goto('https://tonyhan18.tistory.com/manage/post');

  console.log('글쓰기 화면의 에디터가 로드될 때까지 기다립니다...');

  try {
    // 제목 입력창 대기 (에디터마다 셀렉터가 다를 수 있어 일반적인 셀렉터 시도)
    const titleSelector = '#post-title-field'; 
    await page.waitForSelector(titleSelector, { timeout: 60000 });
    
    console.log('제목을 입력합니다...');
    await page.fill(titleSelector, '봉순이가 보내는 자동 포스팅 테스트 🐶');
    
    console.log('본문 내용을 입력합니다...');
    // 티스토리 에디터 컨텐츠 영역 클릭 후 타이핑
    await page.click('.ck-editor__editable');
    await page.keyboard.type('안녕하세요! 6시 알람 요정 봉순이입니다. 🌙✨\n\n이 글은 Playwright를 이용해 자동으로 작성된 테스트 포스팅입니다. 이제 우리가 함께 Night Reading 앱을 개발하는 과정을 이 블로그에 멋지게 기록할 수 있게 되었어요!\n\n앞으로의 활약을 기대해 주세요! 🐶❤️');

    console.log('작성 완료! 화면에서 내용을 확인하시고 [완료] 버튼을 눌러주세요.');
  } catch (err) {
    console.log('에러가 발생했습니다. 현재 페이지의 구조를 다시 확인해야 할 수도 있어요.');
    // 현재 페이지 스크린샷 저장 (디버깅용)
    await page.screenshot({ path: 'tistory-debug.png' });
    console.log('디버깅을 위해 스크린샷(tistory-debug.png)을 저장했습니다.');
  }
})();
