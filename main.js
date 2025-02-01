/********************************************************************************
*  WEB422 – Assignment 2
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
* 
*  Name: Aksharajsinh Parmar Student ID: 140204223 Date: 28/01/2025
********************************************************************************/

// Base API URL for the backend
const baseUrl = "https://rentinghousewebsite.onrender.com";

// Global variables
let page = 1;
const perPage = 10;
let searchName = null;

// Helper function to fetch and handle API responses
async function fetchAPI(url) {
    try {
        const response = await fetch(url);
        if (response.ok) {
            return response.json();
        } else {
            throw new Error(`Error: ${response.status}`);
        }
    } catch (error) {
        console.error("Failed to fetch API:", error);
        return null;
    }
}

// Load listings data
async function loadListingsData() {
    let url = `${baseUrl}/api/listings?page=${page}&perPage=${perPage}`;
    if (searchName) url += `&name=${encodeURIComponent(searchName)}`;

    const data = await fetchAPI(url);
    const tableBody = document.querySelector("#listingsTable tbody");
    tableBody.innerHTML = ""; // Clear previous data

    if (!data || data.length === 0) {
        if (page > 1) {
            page--; // Go back one page if no data is found
            loadListingsData();
        } else {
            tableBody.innerHTML = `<tr><td colspan="4" class="text-center"><strong>No data available</strong></td></tr>`;
        }
        return;
    }

    // Populate the table with data
    tableBody.innerHTML = data.map(listing => `
        <tr data-id="${listing._id}">
            <td>${listing.name || "N/A"}</td>
            <td>${listing.room_type || "N/A"}</td>
            <td>${listing.address?.street || "N/A"}</td>
            <td>
                ${listing.summary || "No summary available"}<br><br>
                <strong>Accommodates:</strong> ${listing.accommodates || "N/A"}<br>
                <strong>Rating:</strong> ${listing.review_scores?.review_scores_rating || "N/A"}
            </td>
        </tr>
    `).join("");

    // Update the current page number in the pagination
    document.querySelector("#current-page").textContent = page;

    // Add click event to each table row to load modal details
    document.querySelectorAll("#listingsTable tbody tr").forEach(row => {
        row.addEventListener("click", () => loadModalDetails(row.dataset.id));
    });
}


// Load modal details
async function loadModalDetails(id) {
    const listing = await fetchAPI(`${baseUrl}/api/listings/${id}`);
    if (!listing) {
        console.error("Failed to load listing details");
        return;
    }

    // Populate modal title and body
    document.querySelector("#detailsModalLabel").textContent = listing.name || "No title available";
    document.querySelector("#detailsModal .modal-body").innerHTML = `
        <img 
            src="${listing.images?.picture_url || 'https://placehold.co/600x400?text=No+Image'}" 
            class="img-fluid w-100 mb-3"
            alt="${listing.name || 'Image'}"
        >
        <p>${listing.neighborhood_overview || "No neighborhood overview available"}</p>
        <strong>Price:</strong> $${listing.price?.toFixed(2) || "N/A"}<br>
        <strong>Room Type:</strong> ${listing.room_type || "N/A"}<br>
        <strong>Bed Type:</strong> ${listing.bed_type || "N/A"} (${listing.beds || 0} beds)<br>
    `;

    // Show the modal
    const modal = new bootstrap.Modal(document.querySelector("#detailsModal"));
    modal.show();
}

// Pagination functionality
document.querySelector("#previous-page").addEventListener("click", () => {
    if (page > 1) {
        page--;
        loadListingsData();
    }
});

document.querySelector("#next-page").addEventListener("click", () => {
    page++;
    loadListingsData();
});

// Search functionality
document.querySelector("#searchForm").addEventListener("submit", event => {
    event.preventDefault();
    searchName = document.querySelector("#name").value.trim();
    page = 1; // Reset to page 1
    loadListingsData();
});

document.querySelector("#clearForm").addEventListener("click", () => {
    document.querySelector("#name").value = "";
    searchName = null;
    page = 1; // Reset to page 1
    loadListingsData();
});

// Load data on initial page load
document.addEventListener("DOMContentLoaded", loadListingsData);
