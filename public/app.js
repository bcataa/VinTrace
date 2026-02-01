// ============================================
// PAGE MANAGEMENT
// ============================================
const inputPage = document.getElementById('inputPage');
const loadingPage = document.getElementById('loadingPage');
const resultsPage = document.getElementById('resultsPage');
const contactPage = document.getElementById('contactPage');
const vinInput = document.getElementById('vinInput');
const vinDisplay = document.getElementById('vinDisplay');
const errorMessage = document.getElementById('errorMessage');
const resultGrid = document.getElementById('resultGrid');
const backBtn = document.getElementById('backBtn');
const contactBtn = document.getElementById('contactBtn');
const contactBackBtn = document.getElementById('contactBackBtn');
const sourcesContainer = document.getElementById('sources');
const sourcesList = document.getElementById('sourcesList');
const statusText = document.getElementById('statusText');
const contactForm = document.getElementById('contactForm');

let currentVIN = '';

// ============================================
// PAGE TRANSITIONS
// ============================================
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
}

// ============================================
// PAGE 1: VIN INPUT PAGE
// ============================================
const circleProgress = document.querySelector('.circle-progress-bar');
const CIRCUMFERENCE = 565.48; // 2 * PI * 90 (radius)

// Valid VIN characters (excludes I, O, Q)
const VALID_VIN_CHARS = /^[A-HJ-NPR-Z0-9]+$/;

vinInput.addEventListener('input', (e) => {
    let vin = e.target.value.toUpperCase();
    currentVIN = vin;
    
    // Check for invalid characters (I, O, Q)
    const hasInvalidChars = /[IOQ]/i.test(vin);
    
    // Remove invalid characters but keep the input
    const cleanedVin = vin.replace(/[^A-HJ-NPR-Z0-9]/g, '');
    vinInput.value = cleanedVin;
    vinDisplay.textContent = cleanedVin;
    
    const length = cleanedVin.length;
    const progress = (length / 17) * CIRCUMFERENCE;
    const offset = CIRCUMFERENCE - progress;
    
    // Update progress bar
    circleProgress.style.strokeDashoffset = offset;
    
    // Remove previous state classes
    circleProgress.classList.remove('valid', 'invalid');
    hideError();
    
    // Check for invalid characters
    if (hasInvalidChars || (length > 0 && !VALID_VIN_CHARS.test(cleanedVin))) {
        // Invalid characters detected - red circle
        circleProgress.classList.add('invalid');
        showError('VIN cannot contain letters I, O, or Q.');
    } else if (length === 17) {
        // Valid VIN - green with glow
        circleProgress.classList.add('valid');
        
        // Auto-navigate to loading page after a brief delay
        setTimeout(() => {
            if (cleanedVin.length === 17) {
                startVINCheck(cleanedVin);
            }
        }, 800);
    } else if (length > 17) {
        // Invalid - too long
        circleProgress.classList.add('invalid');
        showError('VIN must be exactly 17 characters.');
    }
});

// Handle Enter key
vinInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && vinInput.value.length === 17) {
        startVINCheck(vinInput.value);
    }
});

// ============================================
// PAGE 2: LOADING PAGE - SLOT MACHINE
// ============================================
function startVINCheck(vin) {
    currentVIN = vin.toUpperCase();
    showPage('loadingPage');
    
    // Initialize slot machine
    initSlotMachine(vin);
    
    // Start API call
    fetchVINData(vin);
}

function initSlotMachine(vin) {
    const slotReel = document.getElementById('slotReel');
    slotReel.innerHTML = '';
    
    // Create character slots
    const chars = vin.split('');
    chars.forEach((char, index) => {
        const slot = document.createElement('div');
        slot.className = 'slot-character scrolling';
        slot.textContent = char;
        slot.dataset.index = index;
        slot.dataset.target = char;
        slotReel.appendChild(slot);
    });
    
    // Start slot machine animation
    animateSlotMachine(chars);
    
    // Update status text progressively
    updateStatusText();
}

function animateSlotMachine(chars) {
    const slots = document.querySelectorAll('.slot-character');
    const lockDelay = 200; // Delay between each character lock
    
    slots.forEach((slot, index) => {
        setTimeout(() => {
            // Generate random characters while scrolling
            const randomChars = 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789';
            let scrollCount = 0;
            const maxScrolls = 20 + Math.random() * 20; // Random scroll count
            
            const scrollInterval = setInterval(() => {
                scrollCount++;
                const randomChar = randomChars[Math.floor(Math.random() * randomChars.length)];
                
                // Update only the text content, don't move the container
                slot.textContent = randomChar;
                
                if (scrollCount >= maxScrolls) {
                    clearInterval(scrollInterval);
                    // Lock to target character
                    slot.textContent = slot.dataset.target;
                    slot.classList.remove('scrolling');
                    slot.classList.add('locked');
                }
            }, 50);
        }, index * lockDelay);
    });
}

function updateStatusText() {
    const statuses = [
        'Validating VIN format...',
        'Contacting vehicle databases...',
        'Analyzing manufacturer and model...',
        'Gathering vehicle specifications...',
        'Finalizing results...'
    ];
    
    let currentIndex = 0;
    const statusInterval = setInterval(() => {
        if (currentIndex < statuses.length) {
            statusText.textContent = statuses[currentIndex];
            currentIndex++;
        } else {
            clearInterval(statusInterval);
        }
    }, 2000);
}

// ============================================
// API CALL
// ============================================
async function fetchVINData(vin) {
    try {
        const response = await fetch('/api/vin/lookup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ vin })
        });
        
        const data = await response.json();
        
        // Wait a bit for slot machine to finish
        setTimeout(() => {
            if (!response.ok) {
                showErrorPage(data.error || `Error ${response.status}`);
                return;
            }
            
            // Display results - folosește datele combinate din data.data
            console.log('API Response:', { 
                hasData: !!data.data, 
                dataKeys: data.data ? Object.keys(data.data).length : 0,
                success: data.success,
                error: data.error,
                sources: data.sources,
                sampleData: data.data ? { 
                    make: data.data.make, 
                    model: data.data.model, 
                    year: data.data.year,
                    vin: data.data.vin,
                    allKeys: Object.keys(data.data)
                } : null
            });
            
            // Afișează rezultatele chiar dacă sunt puține date
            if (data.data && Object.keys(data.data).length > 0) {
                displayResults(data.data, data.sources || []);
            } else if (data.error) {
                // Dacă există eroare, o afișăm
                showErrorPage(data.error || 'Nu s-au putut obține date pentru acest VIN');
            } else {
                console.warn('No data in response, showing empty results');
                displayResults({}, data.sources || []);
            }
        }, 3000); // Wait for slot machine animation
        
    } catch (error) {
        console.error('Error:', error);
        setTimeout(() => {
            showErrorPage('Error connecting to server. Please try again.');
        }, 3000);
    }
}

function showErrorPage(message) {
    showPage('inputPage');
    showError(message);
    // Reset input
    vinInput.value = '';
    vinDisplay.textContent = '';
    circleProgress.style.strokeDashoffset = CIRCUMFERENCE;
    circleProgress.classList.remove('valid', 'invalid');
}

// ============================================
// PAGE 3: RESULTS PAGE
// ============================================
function displayResults(combinedData = {}, allSources = []) {
    // Navigate to results page
    showPage('resultsPage');
    
    resultGrid.innerHTML = '';
    
    // Display combined data as a single result card
    if (combinedData && Object.keys(combinedData).length > 0) {
        const card = createResultCard(combinedData);
        resultGrid.appendChild(card);
    } else {
        // If no results at all
        const noResultsCard = document.createElement('div');
        noResultsCard.className = 'result-card';
        noResultsCard.innerHTML = `
            <div class="card-header">
                <h3 class="card-title">No Results Found</h3>
                <span class="status-indicator error"></span>
            </div>
            <div class="card-content">
                <p style="color: var(--text-secondary);">No information available for this VIN number.</p>
            </div>
        `;
        resultGrid.appendChild(noResultsCard);
    }
}

function createResultCard(data) {
    const card = document.createElement('div');
    card.className = 'result-card premium-card';
    
    if (!data || typeof data !== 'object' || data === null || Object.keys(data).length === 0) {
        card.innerHTML = `
            <div class="card-header premium-header">
                <div class="header-content">
                    <div class="header-icon">🚗</div>
                    <h3 class="card-title">Vehicle Information</h3>
                </div>
                <span class="status-indicator success"></span>
            </div>
            <div class="card-content">
                <p class="no-data-message">No data available</p>
            </div>
        `;
        return card;
    }
    
    // Organize fields into logical groups
    const basicInfo = [];
    const engineInfo = [];
    const performanceInfo = [];
    const dimensionsInfo = [];
    const otherInfo = [];
    
    const fieldGroups = {
        basic: ['make', 'manufacturer', 'model', 'year', 'vehicle_type', 'body_type', 'color', 'plant_country'],
        engine: ['engine', 'engine_code', 'engine_displacement', 'engine_displacement_ccm', 'engine_power_hp', 'power_hp', 'engine_power_kw', 'torque_nm', 'cylinders', 'fuel_type', 'fuel_type_primary'],
        performance: ['transmission', 'transmission_type', 'gears', 'number_of_gears', 'drive_type', 'max_speed_kmh', 'acceleration_0_100_sec', 'fuel_consumption_l_100km', 'co2_emissions_g_km', 'average_co2_emission_gkm'],
        dimensions: ['length_mm', 'width_mm', 'height_mm', 'wheelbase_mm', 'wheelbase_array_mm', 'track_front_mm', 'track_rear_mm', 'trunk_volume_min_l', 'trunk_volume_max_l', 'weight_kg', 'weight_empty_kg', 'max_weight_kg'],
        other: ['doors', 'number_of_doors', 'seats', 'number_of_seats', 'number_wheels', 'number_of_axles']
    };
    
    const fieldLabels = {
        make: 'Make / Brand', manufacturer: 'Manufacturer', model: 'Model', year: 'Year',
        vehicle_type: 'Vehicle Type', body_type: 'Body Type', color: 'Color', plant_country: 'Plant Country',
        engine: 'Engine', engine_code: 'Engine Code', engine_displacement: 'Engine Displacement',
        engine_displacement_ccm: 'Engine Displacement (ccm)', engine_power_hp: 'Engine Power (HP)',
        power_hp: 'Power (HP)', engine_power_kw: 'Engine Power (kW)', torque_nm: 'Torque (Nm)',
        cylinders: 'Cylinders', fuel_type: 'Fuel Type', fuel_type_primary: 'Fuel Type',
        transmission: 'Transmission', transmission_type: 'Transmission Type', gears: 'Gears',
        number_of_gears: 'Number of Gears', drive_type: 'Drive Type', max_speed_kmh: 'Max Speed (km/h)',
        acceleration_0_100_sec: 'Acceleration 0-100km/h (sec)', fuel_consumption_l_100km: 'Fuel Consumption (l/100km)',
        co2_emissions_g_km: 'CO2 Emissions (g/km)', average_co2_emission_gkm: 'CO2 Emissions (g/km)',
        length_mm: 'Length (mm)', width_mm: 'Width (mm)', height_mm: 'Height (mm)',
        wheelbase_mm: 'Wheelbase (mm)', track_front_mm: 'Track Front (mm)', track_rear_mm: 'Track Rear (mm)',
        trunk_volume_min_l: 'Trunk Volume Min (l)', trunk_volume_max_l: 'Trunk Volume Max (l)',
        weight_kg: 'Weight (kg)', weight_empty_kg: 'Weight Empty (kg)', max_weight_kg: 'Max Weight (kg)',
        doors: 'Doors', number_of_doors: 'Doors', seats: 'Seats', number_of_seats: 'Seats',
        number_wheels: 'Number of Wheels', number_of_axles: 'Number of Axles'
    };
    
    let displayedFields = new Set();
    
    // Organize fields
    Object.keys(data).forEach(key => {
        if (key === 'raw_data' || key === 'all_data' || key === 'options' || key === 'source') return;
        if (displayedFields.has(key)) return;
        
        const value = data[key];
        if (value === null || value === undefined || value === '' || value === 'null') return;
        
        const field = { key, label: fieldLabels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), value };
        
        if (fieldGroups.basic.includes(key)) {
            basicInfo.push(field);
        } else if (fieldGroups.engine.includes(key)) {
            engineInfo.push(field);
        } else if (fieldGroups.performance.includes(key)) {
            performanceInfo.push(field);
        } else if (fieldGroups.dimensions.includes(key)) {
            dimensionsInfo.push(field);
        } else if (fieldGroups.other.includes(key)) {
            otherInfo.push(field);
        } else {
            otherInfo.push(field);
        }
        
        displayedFields.add(key);
    });
    
    // Build premium card content
    let cardContent = `
        <div class="card-header premium-header">
            <div class="header-content">
                <div class="header-logo">
                    <svg width="50" height="50" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <linearGradient id="vGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style="stop-color:#ffa64d;stop-opacity:1" />
                                <stop offset="50%" style="stop-color:#ff8c00;stop-opacity:1" />
                                <stop offset="100%" style="stop-color:#cc7000;stop-opacity:1" />
                            </linearGradient>
                            <linearGradient id="tGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style="stop-color:#ffffff;stop-opacity:0.95" />
                                <stop offset="50%" style="stop-color:#e0e0e0;stop-opacity:1" />
                                <stop offset="100%" style="stop-color:#c0c0c0;stop-opacity:1" />
                            </linearGradient>
                        </defs>
                        <path d="M 10 20 L 30 60 L 35 60 L 50 20 L 45 20 L 33 55 L 32 55 L 15 20 Z" fill="url(#vGradient)" />
                        <path d="M 60 20 L 90 20 L 90 25 L 75 25 L 75 60 L 70 60 L 70 25 L 60 25 Z" fill="url(#tGradient)" />
                    </svg>
                </div>
                <div class="header-text">
                    <h3 class="card-title">${data.make && data.model ? `${data.make} ${data.model}` : 'Vehicle Information'}</h3>
                    ${data.year ? `<p class="card-subtitle">${data.year}</p>` : ''}
                </div>
            </div>
            <span class="status-indicator success"></span>
        </div>
        <div class="card-content premium-content multi-column-layout">
    `;
    
    // COLUMN 1: Basic Information
    if (basicInfo.length > 0) {
        cardContent += `
            <div class="info-column">
                <div class="info-section compact-section">
                    <div class="section-title">
                        <span class="section-icon">📋</span>
                        <h4>Basic Information</h4>
                    </div>
                    <div class="info-list">
        `;
        basicInfo.forEach(field => {
            cardContent += `
                <div class="info-item premium-item compact-item">
                    <span class="info-label">${field.label}</span>
                    <span class="info-value">${field.value}</span>
                </div>
            `;
        });
        cardContent += `</div></div></div>`;
    }
    
    // COLUMN 2: Engine Specifications
    if (engineInfo.length > 0) {
        cardContent += `
            <div class="info-column">
                <div class="info-section compact-section">
                    <div class="section-title">
                        <span class="section-icon">⚙️</span>
                        <h4>Engine Specifications</h4>
                    </div>
                    <div class="info-list">
        `;
        engineInfo.forEach(field => {
            cardContent += `
                <div class="info-item premium-item compact-item">
                    <span class="info-label">${field.label}</span>
                    <span class="info-value">${field.value}</span>
                </div>
            `;
        });
        cardContent += `</div></div></div>`;
    }
    
    // COLUMN 3: Performance
    if (performanceInfo.length > 0) {
        cardContent += `
            <div class="info-column">
                <div class="info-section compact-section">
                    <div class="section-title">
                        <span class="section-icon">🏁</span>
                        <h4>Performance</h4>
                    </div>
                    <div class="info-list">
        `;
        performanceInfo.forEach(field => {
            cardContent += `
                <div class="info-item premium-item compact-item">
                    <span class="info-label">${field.label}</span>
                    <span class="info-value">${field.value}</span>
                </div>
            `;
        });
        cardContent += `</div></div></div>`;
    }
    
    // COLUMN 4: Dimensions & Other
    if (dimensionsInfo.length > 0 || otherInfo.length > 0) {
        cardContent += `
            <div class="info-column">
        `;
        
        if (dimensionsInfo.length > 0) {
            cardContent += `
                <div class="info-section compact-section">
                    <div class="section-title">
                        <span class="section-icon">📐</span>
                        <h4>Dimensions & Weight</h4>
                    </div>
                    <div class="info-list">
            `;
            dimensionsInfo.forEach(field => {
                cardContent += `
                    <div class="info-item premium-item compact-item">
                        <span class="info-label">${field.label}</span>
                        <span class="info-value">${field.value}</span>
                    </div>
                `;
            });
            cardContent += `</div></div>`;
        }
        
        if (otherInfo.length > 0) {
            cardContent += `
                <div class="info-section compact-section">
                    <div class="section-title">
                        <span class="section-icon">ℹ️</span>
                        <h4>Additional Information</h4>
                    </div>
                    <div class="info-list">
            `;
            otherInfo.forEach(field => {
                cardContent += `
                    <div class="info-item premium-item compact-item">
                        <span class="info-label">${field.label}</span>
                        <span class="info-value">${field.value}</span>
                    </div>
                `;
            });
            cardContent += `</div></div>`;
        }
        
        cardContent += `</div>`;
    }
    
    cardContent += `</div>`;
    card.innerHTML = cardContent;
    
    return card;
}

function createDatabaseCard(databaseData) {
    const card = document.createElement('div');
    card.className = 'result-card';
    
    let cardContent = `
        <div class="card-header">
            <h3 class="card-title">Database Information</h3>
            <span class="status-indicator warning"></span>
        </div>
        <div class="card-content">
    `;
    
    const dbFields = [
        { key: 'make', label: 'Make / Brand' },
        { key: 'model', label: 'Model' },
        { key: 'year', label: 'Year' },
        { key: 'engine', label: 'Engine' },
        { key: 'transmission', label: 'Transmission' },
        { key: 'color', label: 'Color' },
        { key: 'mileage', label: 'Mileage' },
        { key: 'owner_count', label: 'Owner Count' },
        { key: 'registration_date', label: 'Registration Date' },
        { key: 'last_updated', label: 'Last Updated' }
    ];
    
    let hasData = false;
    dbFields.forEach(field => {
        const value = databaseData[field.key];
        if (value !== null && value !== undefined && value !== '' && value !== 'null') {
            hasData = true;
            cardContent += `
                <div class="data-item">
                    <span class="data-label">${field.label}</span>
                    <span class="data-value">${value}</span>
                </div>
            `;
        }
    });
    
    if (!hasData) {
        cardContent += `<p style="color: var(--text-secondary);">No database data available</p>`;
    }
    
    cardContent += `</div>`;
    card.innerHTML = cardContent;
    
    return card;
}

function renderSources(sources) {
    if (!sourcesList || !sourcesContainer) return;
    
    sourcesList.innerHTML = '';
    if (!sources || sources.length === 0) {
        sourcesContainer.style.display = 'none';
        return;
    }
    
    const successCount = sources.filter(s => s.success).length;
    const totalCount = sources.length;
    
    const summaryHeader = document.createElement('div');
    summaryHeader.className = 'source-item';
    summaryHeader.style.gridColumn = '1 / -1';
    summaryHeader.style.marginBottom = '15px';
    summaryHeader.innerHTML = `<strong style="color: var(--text-primary);">Status: ${successCount}/${totalCount} sources successful</strong>`;
    sourcesList.appendChild(summaryHeader);
    
    sources.forEach(src => {
        const sourceItem = document.createElement('div');
        sourceItem.className = `source-item ${src.success ? 'success' : 'error'}`;
        
        const statusText = src.success ? '✓ Success' : `✗ ${src.error || 'Failed'}`;
        const statusClass = src.success ? 'success' : 'error';
        const sourceName = src.source.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        sourceItem.innerHTML = `
            <div class="source-name">${sourceName}</div>
            <div class="source-status ${statusClass}">${statusText}</div>
        `;
        
        sourcesList.appendChild(sourceItem);
    });
    
    sourcesContainer.style.display = 'block';
}

// ============================================
// ERROR HANDLING
// ============================================
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
}

function hideError() {
    errorMessage.classList.remove('show');
}

// ============================================
// NAVIGATION
// ============================================
backBtn.addEventListener('click', () => {
    showPage('inputPage');
    vinInput.value = '';
    vinDisplay.textContent = '';
    circleProgress.style.strokeDashoffset = CIRCUMFERENCE;
    circleProgress.classList.remove('valid', 'invalid');
    hideError();
    resultGrid.innerHTML = '';
    sourcesContainer.style.display = 'none';
    vinInput.focus();
});

contactBtn.addEventListener('click', () => {
    showPage('contactPage');
});

contactBackBtn.addEventListener('click', () => {
    showPage('inputPage');
    vinInput.focus();
});

// ============================================
// CONTACT FORM
// ============================================
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(contactForm);
        const submitBtn = contactForm.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        
        try {
            const response = await fetch(contactForm.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                submitBtn.textContent = 'Message Sent!';
                submitBtn.style.background = 'var(--success-green)';
                contactForm.reset();
                
                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.style.background = '';
                    submitBtn.disabled = false;
                }, 3000);
            } else {
                throw new Error('Form submission failed');
            }
        } catch (error) {
            console.error('Error:', error);
            submitBtn.textContent = 'Error - Try Again';
            submitBtn.style.background = 'var(--error-red)';
            
            setTimeout(() => {
                submitBtn.textContent = originalText;
                submitBtn.style.background = '';
                submitBtn.disabled = false;
            }, 3000);
        }
    });
}

// Initialize on page load
window.addEventListener('load', () => {
    vinInput.focus();
});
