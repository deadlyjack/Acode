import Ref from 'html-tag-js/ref';

/**
 * 
 * @param {object} param0 
 * @param {string} param0.id
 * @returns 
 */
export default function TabView({ id }, children) {
  let moveX = 0;
  let lastX = 0;
  const el = new Ref();
  return <div ref={el} onclick={changeTab} ontouchstart={ontouchstart} className='main' id={id}>{children}</div>;

  function ontouchstart(e) {
    moveX = 0;
    lastX = e.touches[0].clientX;
    document.addEventListener('touchmove', omtouchmove, { passive: true });
    document.addEventListener('touchend', omtouchend);
    document.addEventListener('touchcancel', omtouchend);
  }

  function omtouchmove(e) {
    const { clientX } = e.touches[0];
    moveX += (lastX - clientX);
    lastX = clientX;
  }

  function omtouchend() {
    document.removeEventListener('touchmove', omtouchmove);
    document.removeEventListener('touchend', omtouchend);
    document.removeEventListener('touchcancel', omtouchend);
    if (Math.abs(moveX) <= 100) return;
    const tabs = Array.from(el.get('.options').children);
    const currentTab = el.get('.options>span.active');
    const direction = moveX > 0 ? 1 : -1;
    const currentTabIndex = tabs.indexOf(currentTab);
    const nextTabIndex = (currentTabIndex + direction + tabs.length) % tabs.length;
    tabs[nextTabIndex].click();
    currentTab.classList.remove('active');
    tabs[nextTabIndex].classList.add('active');
  }

  function changeTab(e) {
    const { target } = e;
    if (!target.matches('.options>span')) return;
    const currentTab = el.get('.options>span.active');
    if (target === currentTab) return;
    currentTab.classList.remove('active');
    target.classList.add('active');
  }
}