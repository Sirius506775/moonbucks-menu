import { $ } from "./utils/dom.js";
import store from "./store/index.js";
  
//TODO 서버 요청 부분
// - [x] 웹 서버를 띄우기
// - [ ] 서버에 새로운 메뉴명을 추가될 수 있도록 요청한다.
// - [ ] 카테고리별 메뉴리스트를 불러온다.
// - [ ] 서버에 메뉴가 수정될 수 있도록 요청한다.
// - [ ] 서버에 메뉴의 품절상태가 토글될 수 있도록 요청한다.
// - [ ] 서버에 메뉴가 섹체할 수 있도록 요청한다.

// TODO 리펙터링 부분
// - [ ] localStorage에 저장하는 로직은 지운다.
// - [ ] fetch 비동기 api를 사용하는 부분을 async await을 사용하여 구현한다.

// TODO 사용자 경험
// - [ ] API 통신이 실패하는 경우에 대해 사용자가 알 수 있게 [alert]으로 예외처리를 진행한다.
// - [ ] 중복되는 메뉴는 추가할 수 없다.

const BASE_URL = 'http://localhost:3000/api';

function App() {
  //상태는 변하는 데이터, 이 앱에서 변하는 것이 무엇인가? - 메뉴명
  this.menu = {
    espresso: [],
    frappuccino: [],
    blended: [],
    teavana: [],
    desert: []
  };
  this.currentCategory = "espresso";

  this.init = () => {
    if (store.getLocalStorage()) {
      this.menu = store.getLocalStorage();
    }
    render();
    initEventListener();
  };

  const render = () => {
    const template = this.menu[this.currentCategory]
      .map((menuItem, index) => {
        return `<li data-menu-id="${index}" class="menu-list-item d-flex items-center py-2">
  <span class="w-100 pl-2 menu-name ${menuItem.soldOut ? "sold-out" : ""}">${
          menuItem.name
        }</span>
  <button
  type="button"
  class="bg-gray-50 text-gray-500 text-sm mr-1 menu-sold-out-button"
>
  품절
</button>
  <button
    type="button"
    class="bg-gray-50 text-gray-500 text-sm mr-1 menu-edit-button"
  >
    수정
  </button>
  <button
    type="button"
    class="bg-gray-50 text-gray-500 text-sm menu-remove-button"
  >
    삭제
  </button>
</li>`;
      })
      .join("");

    $("#menu-list").innerHTML = template;

    updateMenuCount();
  };

  const updateMenuCount = () => {
    const menuCount = this.menu[this.currentCategory].length;
    $(".menu-count").innerText = `총 ${menuCount} 개`;
  };

  const addMenuName = () => {
    if ($("#menu-name").value === "") {
      alert("값을 입력해주세요");
      return;
    }
    const MenuName = $("#menu-name").value;
    fetch(`${BASE_URL}/category/${this.currentCategory}/menu`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name: MenuName }),
    }).then(response => {
      return response.json();
    }).then(data => {
      console.log(data);
    });
    // this.menu[this.currentCategory].push({ name: MenuName });
    store.setLocalStorage(this.menu);
    render();
    $("#menu-name").value = "";
  };

  const updateMenuName = (e) => {
    const menuId = e.target.closest("li").dataset.menuId;
    const $menuName = e.target.closest("li").querySelector(".menu-name");
    const updateMenuName = prompt("메뉴명을 수정하세요", $menuName.innerText);
    this.menu[this.currentCategory][menuId].name = updateMenuName;
    store.setLocalStorage(this.menu);
    render();
  };

  const removeMenuName = (e) => {
    if (confirm("정말 삭제하시겠습니까?")) {
      const menuId = e.target.closest("li").dataset.menuId;
      this.menu[this.currentCategory].splice(menuId, 1);
      store.setLocalStorage(this.menu);
      render();
    }
  };

  const soldOutMenu = (e) => {
    const menuId = e.target.closest("li").dataset.menuId;
    this.menu[this.currentCategory][menuId].soldOut =
      !this.menu[this.currentCategory][menuId].soldOut;
    store.setLocalStorage(this.menu);
    render();
  };

  const initEventListener = () => {
    $("#menu-list").addEventListener("click", (e) => {
      if (e.target.classList.contains("menu-edit-button")) {
        updateMenuName(e);
        return;
      }
  
      if (e.target.classList.contains("menu-remove-button")) {
        removeMenuName(e);
        return;
      }
  
      if (e.target.classList.contains("menu-sold-out-button")) {
        soldOutMenu(e);
        return;
      }
    });
  
    $("#menu-form").addEventListener("submit", (e) => {
      e.preventDefault();
    });
  
    $("#menu-submit-button").addEventListener("click", addMenuName);
  
    $("#menu-name").addEventListener("keypress", (e) => {
      if (e.key !== "Enter") {
        return;
      }
      addMenuName();
    });
  
    $("nav").addEventListener("click", (e) => {
      const isCategoryButton = e.target.classList.contains("cafe-category-name");
      if (isCategoryButton) {
        const categoryName = e.target.dataset.categoryName;
        this.currentCategory = categoryName;
        $("#category-title").innerText = `${e.target.innerText} 메뉴 관리`;
        render();
      }
    });
  };

}

const app = new App();
//new 키워드를 사용하여 생성자 함수를 호출하게 되면 이때의 this는 "만들어질 객체"를 참조한다.
app.init();
