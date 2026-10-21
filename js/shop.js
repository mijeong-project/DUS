/* 상품/장바구니 페이지 전용 (수량·합계 계산). 다른 페이지는 JS 없이 동작합니다. */
(function () {
  const $ = (s, p = document) => p.querySelector(s);
  const $$ = (s, p = document) => [...p.querySelectorAll(s)];
  const won = n => n.toLocaleString('ko-KR');
  const SHIPPING = 2500, DISCOUNT = 2500;   // ← 배송비 / 할인 정책에 맞게 수정

  // 수량 버튼 (+ / -)
  function stepper(root, onChange) {
    root.addEventListener('click', e => {
      const b = e.target.closest('.qty button'); if (!b) return;
      const inp = $('input', b.parentNode);
      inp.value = Math.min(99, Math.max(1, (+inp.value || 1) + (+b.dataset.q)));
      onChange();
    });
  }

  /* ---- 상품 상세 ---- */
  const opt = $('#opt');
  if (opt) {
    const qty = $('#pdQty');
    const render = () => {
      const n = +qty.value, price = +opt.value;
      $('#optName').textContent = '젠틀블랜드 두피커버미스트 ' + opt.selectedOptions[0].dataset.size;
      $('#optPrice').textContent = won(price * n) + '원';
      $('#pdTotal').textContent = won(price * n);
      $('#pdCnt').textContent = n;
    };
    const size = new URLSearchParams(location.search).get('size');   // shop.html?size=100 → 100ml 선택
    if (size) [...opt.options].forEach((o, i) => { if (o.dataset.size === size + 'ml') opt.selectedIndex = i; });
    opt.addEventListener('change', render);
    stepper(document, render);
    render();
  }

  /* ---- 장바구니 ---- */
  const list = $('#cartList');
  if (list) {
    const rows = () => $$('.c-item', list);
    const calc = () => {
      let sub = 0, cnt = 0;
      rows().forEach(r => {
        const price = $('.c-price', r), line = (+$('.qty input', r).value) * (+price.dataset.unit);
        price.textContent = '₩ ' + won(line);
        if ($('.c-chk', r).checked) { sub += line; cnt++; }
      });
      const total = rows().length;
      $('#chkAll').checked = total > 0 && cnt === total;
      $('#chkCnt').textContent = `(${cnt}/${total})`;
      $('#cartEmpty').hidden = total > 0;
      const has = sub > 0, dis = has ? DISCOUNT : 0, ship = has ? SHIPPING : 0;
      $('#sOrder').textContent = '₩ ' + won(sub);
      $('#sDis').textContent = '- ₩ ' + won(dis);
      $('#sShip').textContent = '+ ₩ ' + won(ship);
      $('#sFinal').textContent = '₩ ' + won(sub - dis + ship);
    };
    stepper(list, calc);
    list.addEventListener('change', calc);
    $('#chkAll').addEventListener('change', e => { rows().forEach(r => { $('.c-chk', r).checked = e.target.checked; }); calc(); });
    $('#delSel').addEventListener('click', () => { rows().forEach(r => { if ($('.c-chk', r).checked) r.remove(); }); calc(); });
    calc();
  }
})();
