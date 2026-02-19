import { chromium } from 'playwright';

(async () => {
  // 브라우저 실행 (GUI를 볼 수 있도록 headless: false 설정)
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('티스토리 관리자 페이지로 이동합니다...');
  await page.goto('https://tonyhan18.tistory.com/manage/post');

  console.log('로그인이 필요할 수 있습니다. 브라우저 창에서 로그인을 진행해 주세요.');
  console.log('로그인이 완료되고 글쓰기 화면이 나오면 제가 글을 작성을 시도하겠습니다.');

  // 글쓰기 화면의 제목 입력창이 나타날 때까지 대기 (최대 5분)
  try {
    await page.waitForSelector('#post-title-field', { timeout: 300000 });
    
    console.log('글쓰기 화면 감지! 테스트 포스팅을 작성합니다.');
    
    await page.fill('#post-title-field', '봉순이가 보내는 자동 포스팅 테스트 🐶');
    
    // 티스토리 에디터는 iframe이나 복잡한 구조일 수 있으므로 포커스 후 타이핑 시도
    await page.click('.ck-editor__editable');
    await page.keyboard.type('안녕하세요! 이 글은 봉순이가 Playwright를 이용해 자동으로 작성한 테스트 포스팅입니다. 🌙✨\n\n현재 Night Reading 앱 개발 과정을 블로그에 자동으로 기록하는 시스템을 구축 중이에요. 잘 올라갔나요?');

    console.log('작성 완료! 발행 버튼은 직접 확인 후 눌러주시는 것이 안전합니다.');
  } catch (err) {
    console.log('시간 초과 또는 에러 발생: ', err);
  }
})();
