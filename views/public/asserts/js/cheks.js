
function chekbox() {
    const el = document.getElementsByClassName("form-check-input");
    document.getElementById("all").checked = false;
    for (let index = 0; index < el.length; index++) {
        const element = el[index];
        if (element.checked) {
            document.getElementById("all").checked = true;
        }
    }
}

function chekboxAll() {
    const el = document.getElementsByClassName("form-check-input");
    let flag = document.getElementById("all").checked;
    for (let index = 0; index < el.length; index++) {
        const element = el[index];
        element.checked = flag;
    }
}

// URL dan query parametrlarini olish
function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        doc: params.get('doc') || 'Hammasi',
        lang: params.get('lang') || 'Hammasi',
        date: params.get('date') || '',
        employee: params.get('employee') || 'Hammasi',
        search: params.get('search') || ''
    };
}

// Query string yaratish (bo'sh va "Hammasi" qiymatlarni o'tkazib yuborish)
function buildQueryString(params) {
    const query = [];
    if (params.doc && params.doc !== 'Hammasi') query.push('doc=' + encodeURIComponent(params.doc));
    if (params.lang && params.lang !== 'Hammasi') query.push('lang=' + encodeURIComponent(params.lang));
    if (params.date && params.date !== 'Hammasi' && params.date !== '') query.push('date=' + encodeURIComponent(params.date));
    if (params.employee && params.employee !== 'Hammasi') query.push('employee=' + encodeURIComponent(params.employee));
    if (params.search && params.search.length > 0) query.push('search=' + encodeURIComponent(params.search));
    return query.length > 0 ? '?' + query.join('&') : '';
}

let filter1 = document.getElementById("filter1");
let filter2 = document.getElementById("filter2");
let filter3 = document.getElementById("filter3");
let filter3_chek = document.getElementById("filter3_chek");
let filter4 = document.getElementById("filter4");

// Sahifa yuklanganda filterlarni URL dan tiklash
(function restoreFilters() {
    const params = getQueryParams();
    
    if (filter1 && params.doc !== 'Hammasi') {
        for (let i = 0; i < filter1.options.length; i++) {
            if (filter1.options[i].value === params.doc) {
                filter1.selectedIndex = i;
                break;
            }
        }
    }
    if (filter2 && params.lang !== 'Hammasi') {
        for (let i = 0; i < filter2.options.length; i++) {
            if (filter2.options[i].value === params.lang) {
                filter2.selectedIndex = i;
                break;
            }
        }
    }
    if (filter3 && params.date && params.date !== 'Hammasi') {
        filter3.value = params.date;
        if (filter3_chek) filter3_chek.checked = true;
    }
    if (filter4 && params.employee !== 'Hammasi') {
        for (let i = 0; i < filter4.options.length; i++) {
            if (filter4.options[i].value === params.employee) {
                filter4.selectedIndex = i;
                break;
            }
        }
    }
    if (params.search) {
        let searchInput = document.getElementById("searchdata");
        if (searchInput) searchInput.value = params.search;
    }
})();

// Filter o'zgarganda sahifani yangilash
let applyFilters = () => {
    setTimeout(() => {
        let params = {
            doc: filter1 ? filter1.value : 'Hammasi',
            lang: filter2 ? filter2.value : 'Hammasi',
            date: (filter3_chek && filter3_chek.checked && filter3 && filter3.value) ? filter3.value : '',
            employee: filter4 ? filter4.value : 'Hammasi',
            search: ''
        };
        let qs = buildQueryString(params);
        window.location.href = '/certifcate/page/1' + qs;
    }, 500);
};

if (filter1) filter1.onchange = applyFilters;
if (filter2) filter2.onchange = applyFilters;
if (filter3_chek) {
    filter3_chek.onchange = () => {
        if (filter3_chek.checked && filter3 && filter3.value.length > 1) applyFilters();
    };
}
if (filter3) filter3.onchange = () => {
    if (filter3_chek && filter3_chek.checked) applyFilters();
};
if (filter4) filter4.onchange = applyFilters;

// Search tugmasi
let searchBtn = document.getElementById("search");
if (searchBtn) {
    searchBtn.onclick = () => {
        let word = document.getElementById("searchdata").value;
        if (word && word.length > 0) {
            window.location.href = '/certifcate/page/1?search=' + encodeURIComponent(word);
        }
    };
}

// Enter tugmasida ham search ishlashi
let searchInput = document.getElementById("searchdata");
if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            let word = searchInput.value;
            if (word && word.length > 0) {
                window.location.href = '/certifcate/page/1?search=' + encodeURIComponent(word);
            }
        }
    });
}