/* GOYORO — 고요로 캡슐호텔 */
(function () {
  "use strict";

  /* ---------- 모바일 내비게이션 ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      nav.classList.toggle("is-open", !open);
    });

    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        toggle.setAttribute("aria-expanded", "false");
        nav.classList.remove("is-open");
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        toggle.setAttribute("aria-expanded", "false");
        nav.classList.remove("is-open");
        toggle.focus();
      }
    });
  }

  /* ---------- 헤더 그림자 ---------- */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-stuck", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- 스크롤 등장 ---------- */
  var targets = document.querySelectorAll(".reveal");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!targets.length) {
    /* nothing to do */
  } else if (reduce || !("IntersectionObserver" in window)) {
    Array.prototype.forEach.call(targets, function (el) { el.classList.add("is-in"); });
  } else {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
    );
    Array.prototype.forEach.call(targets, function (el) { io.observe(el); });
  }

  /* ---------- 오픈 알림 신청 폼 ----------
     data-endpoint 값이 있으면 그 주소로 전송하고,
     비어 있으면 메일 앱을 열어 같은 내용을 보냅니다. (README 참고) */
  var form = document.getElementById("notify-form");
  if (form) {
    var status = document.getElementById("form-status");

    var show = function (kind, html) {
      if (!status) return;
      status.className = "form-status " + (kind === "ok" ? "is-ok" : "is-err");
      status.innerHTML = html;
      status.setAttribute("role", "status");
    };

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var data = new FormData(form);
      var areas = data.getAll("area");
      var name = (data.get("name") || "").toString().trim();
      var contact = (data.get("contact") || "").toString().trim();

      if (!name || !contact) {
        show("err", "이름과 연락처를 입력해 주세요.");
        return;
      }
      if (!form.querySelector("#agree").checked) {
        show("err", "개인정보 수집·이용 동의가 필요합니다.");
        return;
      }

      var lines = [
        "이름: " + name,
        "연락처: " + contact,
        "관심 권역: " + (areas.length ? areas.join(", ") : "상관없음"),
        "관심 객실: " + (data.get("roomtype") || "미선택"),
        "문의 내용:",
        (data.get("message") || "").toString()
      ];

      var endpoint = form.getAttribute("data-endpoint");
      var submitBtn = form.querySelector('button[type="submit"]');

      if (endpoint) {
        if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "보내는 중…"; }
        fetch(endpoint, {
          method: "POST",
          headers: { Accept: "application/json" },
          body: data
        })
          .then(function (res) {
            if (!res.ok) throw new Error("bad status");
            form.reset();
            show("ok", "<b>신청이 접수되었습니다.</b><br>1호점 오픈 일정이 확정되면 가장 먼저 알려 드리겠습니다.");
          })
          .catch(function () {
            show("err", "전송에 실패했습니다. 잠시 후 다시 시도하시거나 hello@goyoro.kr 로 보내 주세요.");
          })
          .finally(function () {
            if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "오픈 알림 신청하기"; }
          });
        return;
      }

      var mail =
        "mailto:hello@goyoro.kr" +
        "?subject=" + encodeURIComponent("[고요로] 오픈 알림 신청 — " + name) +
        "&body=" + encodeURIComponent(lines.join("\n"));

      window.location.href = mail;
      show(
        "ok",
        "<b>메일 앱으로 신청 내용을 옮겼습니다.</b><br>창이 열리지 않으면 " +
          "<a href=\"mailto:hello@goyoro.kr\">hello@goyoro.kr</a> 로 바로 보내 주세요."
      );
    });
  }

  /* ---------- 현재 연도 ---------- */
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
