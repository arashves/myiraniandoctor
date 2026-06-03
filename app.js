// State Arrays to store data globally once loaded
let doctorsList = [];
let statesList = [];
let specialtiesList = [];

// DOM Element Selectors
const stateFilter = document.getElementById('stateFilter');
const specialtyFilter = document.getElementById('specialtyFilter');
const tableBody = document.getElementById('tableBody');
const resultsCounter = document.getElementById('resultsCounter');

// 1. A Simple Vanilla CSV Parser Helper Function
function parseCSV(text) {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const headers = lines[0].split(',');
    
    return lines.slice(1).map(line => {
        // Simple comma split (assumes no commas inside column strings)
        const values = line.split(','); 
        const obj = {};
        headers.forEach((header, index) => {
            obj[header.trim()] = values[index] ? values[index].trim() : '';
        });
        return obj;
    });
}

// 2. Main Initialization Function (Runs automatically when the page loads)
async function initApp() {
    try {
        // Fetch all three CSV files simultaneously in the background
        const [doctorsResponse, statesResponse, specialtiesResponse] = await Promise.all([
            fetch('data/doctors.csv'),
            fetch('data/states.csv'),
            fetch('data/specialties.csv')
        ]);

        // Convert the raw text data
        const doctorsRawText = await doctorsResponse.text();
        const statesRawText = await statesResponse.text();
        const specialtiesRawText = await specialtiesResponse.text();

        // Parse CSV text into arrays of objects
        doctorsList = parseCSV(doctorsRawText);
        statesList = parseCSV(statesRawText);
        specialtiesList = parseCSV(specialtiesRawText);

        // Populate drop-down filter menus
        populateDropdown(stateFilter, statesList, 'id', 'name');
        populateDropdown(specialtyFilter, specialtiesList, 'id', 'name');

        // Initial render: show all doctors on load
        renderTable(doctorsList);

        // Attach interactive event listeners to filter fields
        stateFilter.addEventListener('change', filterData);
        specialtyFilter.addEventListener('change', filterData);

    } catch (error) {
        console.error("Error loading application data files:", error);
        resultsCounter.textContent = "Error loading directory data. Please try again later.";
    }
}

// Helper to fill drop-downs dynamically
function populateDropdown(selectElement, dataArray, valueKey, textKey) {
    dataArray.forEach(item => {
        const option = document.createElement('option');
        option.value = item[valueKey];
        option.textContent = item[textKey];
        selectElement.appendChild(option);
    });
}

// 3. Render Table Data to View
function renderTable(doctors) {
    tableBody.innerHTML = ''; // Clear prior entries
    
    resultsCounter.textContent = `Showing ${doctors.length} Doctor${doctors.length === 1 ? '' : 's'} Found`;

    if (doctors.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 30px;">No doctors found matching your criteria.</td></tr>`;
        return;
    }

    doctors.forEach(doc => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${doc.name}</strong></td>
            <td><span class="badge specialty">${doc.specialty}</span></td>
            <td><span class="badge state">${doc.state}</span></td>
            <td>${doc.address}</td>
            <td><a href="tel:${doc.phone}">${doc.phone}</a></td>
            <td><em>${doc.affiliation}</em></td>
        `;
        tableBody.appendChild(row);
    });
}

// 4. Multi-Parametric Filter Logic
function filterData() {
    const selectedState = stateFilter.value;
    const selectedSpecialty = specialtyFilter.value;

    const filtered = doctorsList.filter(doc => {
        const matchesState = (selectedState === 'all' || doc.state === selectedState);
        const matchesSpecialty = (selectedSpecialty === 'all' || doc.specialty === selectedSpecialty);
        return matchesState && matchesSpecialty;
    });

    renderTable(filtered);
}

// Run app setup on load
document.addEventListener('DOMContentLoaded', initApp);