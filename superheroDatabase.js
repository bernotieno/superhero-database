export let heroes = [];
export let filteredHeroes = [];
export let currentPage = 1;
export let pageSize = 20;
export let currentSort = { column: 'name', direction: 'asc' };

const heroTable = document.getElementById('heroTable');
const tableBody = heroTable.querySelector('tbody');
const searchInput = document.getElementById('search');
const pageSizeSelect = document.getElementById('pageSize');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const pageInfo = document.getElementById('pageInfo');

// Fetch and load data
fetch('https://rawcdn.githack.com/akabab/superhero-api/0.2.0/api/all.json')
    .then(response => response.json())
    .then(loadData);

export function loadData(data) {
    heroes = data;
    filteredHeroes = [...heroes];
    sortHeroes();
    renderTable();
}

// Event listeners
searchInput.addEventListener('input', handleSearch);
pageSizeSelect.addEventListener('change', handlePageSizeChange);
prevPageBtn.addEventListener('click', () => changePage(-1));
nextPageBtn.addEventListener('click', () => changePage(1));
heroTable.querySelector('thead').addEventListener('click', handleSort);

export function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase();
    filteredHeroes = heroes.filter(hero => hero.name.toLowerCase().includes(searchTerm));
    currentPage = 1;
    renderTable();
}

export function handlePageSizeChange() {
    pageSize = pageSizeSelect.value === 'all' ? filteredHeroes.length : parseInt(pageSizeSelect.value);
    currentPage = 1;
    renderTable();
}

export function changePage(direction) {
    currentPage += direction;
    renderTable();
}

export function handleSort(event) {
    const column = event.target.dataset.sort;
    if (column) {
        if (currentSort.column === column) {
            currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            currentSort.column = column;
            currentSort.direction = 'asc';
        }
        sortHeroes();
        renderTable();
    }
}

export function sortHeroes() {
    const column = currentSort.column;
    const direction = currentSort.direction;

    filteredHeroes.sort((a, b) => {
        let valueA, valueB;

        if (column === 'icon') {
            return 0; // Don't sort by icon
        } else if (column === 'fullName') {
            valueA = a.biography.fullName;
            valueB = b.biography.fullName;
        } else if (column === 'race' || column === 'gender') {
            valueA = a.appearance[column];
            valueB = b.appearance[column];
        } else if (column === 'height' || column === 'weight') {
            valueA = parseFloat(a.appearance[column][1]) || 0;
            valueB = parseFloat(b.appearance[column][1]) || 0;
        } else if (column === 'placeOfBirth' || column === 'alignment') {
            valueA = a.biography[column];
            valueB = b.biography[column];
        } else if (Object.keys(a.powerstats).includes(column)) {
            valueA = a.powerstats[column];
            valueB = b.powerstats[column];
        } else {
            valueA = a[column];
            valueB = b[column];
        }

        if (valueA === null || valueA === undefined || valueA === "") return 1;
        if (valueB === null || valueB === undefined || valueB === "") return -1;

        if (typeof valueA === 'string') valueA = valueA.toLowerCase();
        if (typeof valueB === 'string') valueB = valueB.toLowerCase();

        if (valueA < valueB) return direction === 'asc' ? -1 : 1;
        if (valueA > valueB) return direction === 'asc' ? 1 : -1;
        return 0;
    });
}

export function renderTable() {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const pageHeroes = filteredHeroes.slice(start, end);

    tableBody.innerHTML = '';

    pageHeroes.forEach((hero, index) => {
        const row = document.createElement('tr');

        // Animation and styling applied here
        row.style.opacity = 0;
        row.style.transform = 'translateY(20px)';
        row.style.transition = `opacity 0.5s ease-in ${index * 0.05}s, transform 0.5s ease-in ${index * 0.05}s`;

        row.innerHTML = `
            <td><img src="${hero.images.xs}" alt="${hero.name}"></td>
            <td>${hero.name}</td>
            <td>${hero.biography.fullName || ''}</td>
            <td>${hero.powerstats.intelligence}</td>
            <td>${hero.powerstats.strength}</td>
            <td>${hero.powerstats.speed}</td>
            <td>${hero.powerstats.durability}</td>
            <td>${hero.powerstats.power}</td>
            <td>${hero.powerstats.combat}</td>
            <td>${hero.appearance.race || ''}</td>
            <td>${hero.appearance.gender || ''}</td>
            <td>${hero.appearance.height[1] || ''}</td>
            <td>${hero.appearance.weight[1] || ''}</td>
            <td>${hero.biography.placeOfBirth || ''}</td>
            <td>${hero.biography.alignment || ''}</td>
        `;

        tableBody.appendChild(row);

        // Trigger animation after appending the row
        requestAnimationFrame(() => {
            row.style.opacity = 1;
            row.style.transform = 'translateY(0)';
        });
    });

    updatePagination();
}

export function updatePagination() {
    const totalPages = Math.ceil(filteredHeroes.length / pageSize);
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;
}
