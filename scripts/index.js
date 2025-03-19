// 主题切换
{
  const themeToggleHtml = `<div class="theme-toggle">
	<button class="theme-btn moon" data-theme-type="dark" title="dark">
	<svg data-testid="geist-icon" height="16" stroke-linejoin="round" viewBox="0 0 16 16" width="16" style="color: currentcolor;"><path fill-rule="evenodd" clip-rule="evenodd" d="M10.5 0.25V1V1.5H11L11.75 1.5V3H11H10.5V3.5V4.25H9V3.5V3H8.5H7.75V1.5H8.5H9V1V0.25H10.5ZM3.25514 2.75496C2.33413 3.53491 1.75 4.69972 1.75 6C1.75 8.34721 3.65279 10.25 6 10.25C7.30029 10.25 8.4651 9.66587 9.24505 8.74485C9.16377 8.74827 9.08207 8.74999 9 8.74999C5.82436 8.74999 3.25 6.17563 3.25 2.99999C3.25 2.91792 3.25172 2.83623 3.25514 2.75496ZM0.25 6C0.25 3.51072 1.83142 1.39271 4.042 0.592193L5.00256 1.55275C4.83933 2.00347 4.75 2.49047 4.75 2.99999C4.75 5.3472 6.65279 7.24999 9 7.24999C9.50953 7.24999 9.99653 7.16065 10.4473 6.99743L11.4078 7.95798C10.6073 10.1686 8.48929 11.75 6 11.75C2.82436 11.75 0.25 9.17564 0.25 6Z" fill="currentColor" transform="translate(2.25, 2.25)"></path></svg>
	</button>
	<button class="theme-btn sun" data-theme-type="light" title="light">
	<svg data-testid="geist-icon" height="16" stroke-linejoin="round" viewBox="0 0 16 16" width="16" style="color: currentcolor;"><path fill-rule="evenodd" clip-rule="evenodd" d="M7.75 1V0.25H6.25V1V1.25V2H7.75V1.25V1ZM7 9C8.10457 9 9 8.10457 9 7C9 5.89543 8.10457 5 7 5C5.89543 5 5 5.89543 5 7C5 8.10457 5.89543 9 7 9ZM7 10.5C8.933 10.5 10.5 8.933 10.5 7C10.5 5.067 8.933 3.5 7 3.5C5.067 3.5 3.5 5.067 3.5 7C3.5 8.933 5.067 10.5 7 10.5ZM7.75 12V12.75V13V13.75H6.25V13V12.75V12H7.75ZM12 6.25H12.75H13H13.75V7.75H13H12.75H12V6.25ZM1 6.25H0.25V7.75H1H1.25H2V6.25H1.25H1ZM10.0052 2.93414L10.5355 2.40381L10.7123 2.22703L11.2426 1.6967L12.3033 2.75736L11.773 3.28769L11.5962 3.46447L11.0659 3.9948L10.0052 2.93414ZM2.22703 10.7123L1.6967 11.2426L2.75736 12.3033L3.28769 11.773L3.46447 11.5962L3.9948 11.0659L2.93414 10.0052L2.40381 10.5355L2.22703 10.7123ZM2.93414 3.9948L2.40381 3.46447L2.22703 3.28769L1.6967 2.75736L2.75736 1.6967L3.28769 2.22703L3.46447 2.40381L3.9948 2.93414L2.93414 3.9948ZM10.7123 11.773L11.2426 12.3033L12.3033 11.2426L11.773 10.7123L11.5962 10.5355L11.0659 10.0052L10.0052 11.0659L10.5355 11.5962L10.7123 11.773Z" fill="currentColor" transform="translate(1.25, 1.25)"></path></svg>
	</button>
	<button class="theme-btn system" data-theme-type="system" title="system">
	<svg data-testid="geist-icon" height="16" stroke-linejoin="round" viewBox="0 0 16 16" width="16" style="color: currentcolor;"><path fill-rule="evenodd" clip-rule="evenodd" d="M0.5 3.25C0.5 1.45507 1.95507 0 3.75 0H8.25C10.0449 0 11.5 1.45507 11.5 3.25V11.25V12H10.75H1.25H0.5V11.25V3.25ZM3.75 1.5C2.7835 1.5 2 2.2835 2 3.25V10.5H10V3.25C10 2.2835 9.2165 1.5 8.25 1.5H3.75ZM3 3.5C3 2.94772 3.44772 2.5 4 2.5H8C8.55228 2.5 9 2.94772 9 3.5V7H3V3.5ZM6.5 9.5H9V8H6.5V9.5Z" fill="currentColor" transform="translate(2.5, 2)"></path></svg>
	</button>
</div>`;

  document.querySelector('#pageHeader .right-wrapper .theme-switch').innerHTML =
    themeToggleHtml;

  function setActive(name) {
    const btns = document.querySelectorAll('.theme-btn');
    [...btns]?.forEach((el) => {
      el.classList.remove('active');
      if (el.dataset.themeType === name) {
        el.classList.add('active');
      }
    });
  }

  const rootElement = document.documentElement;
  [
    ...document.querySelectorAll('#pageHeader .theme-toggle .theme-btn'),
  ].forEach((el) => {
    el.addEventListener('click', (e) => {
      rootElement.classList.remove('dark');
      rootElement.classList.add('light');
      const theme = e.target.dataset.themeType;
      switch (theme) {
        case 'dark':
          rootElement.classList.remove('light');
          rootElement.classList.add('dark');
          localStorage.setItem('theme', 'dark');
          setActive('dark');
          break;
        case 'light':
          rootElement.classList.remove('dark');
          rootElement.classList.add('light');
          localStorage.setItem('theme', 'light');
          setActive('light');
          break;
        case 'system':
          rootElement.classList.remove('dark');
          rootElement.classList.remove('light');
          localStorage.removeItem('theme');
          setActive('system');
          break;
        default:
          console.warn(`Unknown theme value: ${theme}.`);
      }
    });
  });

  // 初始化时选中
  document.addEventListener('DOMContentLoaded', () => {
    const theme = localStorage.getItem('theme') || 'system';
    setActive(theme);
  });
}

// 复制代码块
{
  const createIcon = () => {
    const icon = document.createElement('i');
    icon.classList.add('copy');
    icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" height="20" width="20" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2"/></svg>`;

    return icon;
  };

  const codeBlocks = document.querySelectorAll('pre[data-raw]');
  Array.from(codeBlocks).forEach((item) => {
    const icon = createIcon();
    let timer = null;
    icon.addEventListener('click', async () => {
      clearTimeout(timer);
      const text = decodeURIComponent(item.dataset.raw);
      await navigator.clipboard.writeText(text);
      icon.classList.add('copied');
      timer = setTimeout(() => {
        icon.classList.remove('copied');
      }, 2500);
    });
    item.appendChild(icon);
  });
}
