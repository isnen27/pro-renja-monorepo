module.exports=[77930,a=>{"use strict";var b=a.i(7997);function c(){let a=`
    (function() {
      try {
        var saved = localStorage.getItem('aksi-theme');
        var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        var theme = saved || (prefersDark ? 'dark' : 'light');
        var html = document.documentElement;
        html.classList.remove('light', 'dark');
        html.classList.add(theme);
      } catch(e) {
        document.documentElement.classList.add('light');
      }
    })();
  `;return(0,b.jsx)("script",{dangerouslySetInnerHTML:{__html:a}})}a.s(["default",0,function({children:a}){return(0,b.jsxs)("html",{lang:"id",suppressHydrationWarning:!0,children:[(0,b.jsx)("head",{children:(0,b.jsx)(c,{})}),(0,b.jsx)("body",{children:a})]})},"metadata",0,{title:"AKSI - Modul Perencanaan dan Penganggaran",description:"Sistem Informasi Perencanaan dan Penganggaran Pemerintah Daerah"}],77930)},34005,function(a){a.n(a.i(77930))}];

//# sourceMappingURL=apps_web_src_app_layout_tsx_1yx9ufn._.js.map