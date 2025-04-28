// Initialize MSAL if available
if (typeof msal !== 'undefined') {
    try {
        window.msalInstance = new msal.PublicClientApplication(msalConfig);
        
        // Add this login redirect handler
        window.msalInstance.handleRedirectPromise().then(response => {
            // Handle successful login if response exists
            if (response) {
                console.log("Login successful", response);
                fetchCalendarEvents(response.account);
            }
        }).catch(error => {
            console.error("Error during redirect handling:", error);
        });
        
        // Check if user is already signed in
        const accounts = window.msalInstance.getAllAccounts();
        if (accounts.length > 0) {
            // User is already signed in, fetch calendar events
            fetchCalendarEvents(accounts[0]);
        }
    } catch (error) {
        console.error("Error initializing MSAL:", error);
    }
}

// Microsoft Graph API scopes for calendar access
const graphScopes = ["Calendars.Read", "Calendars.ReadWrite"];

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize widgets with real data
    fetchUKBasketballSchedule();
    fetchBengalsSchedule();
    fetchTransySchedule();
    initializeCalendarWidget();
    
    // Set up event listeners for UK Basketball
    document.getElementById('view-all-games').addEventListener('click', function(e) {
        e.stopPropagation();
        showFullBasketballView();
    });
    document.getElementById('back-button').addEventListener('click', hideFullBasketballView);
    document.getElementById('basketball-widget').addEventListener('click', function(e) {
        if (!e.target.classList.contains('view-all') && !e.target.classList.contains('calendar-link')) {
            showFullBasketballView();
        }
    });

    // Set up event listeners for Bengals
    document.getElementById('view-all-bengals').addEventListener('click', function(e) {
        e.stopPropagation();
        showFullBengalsView();
    });
    document.getElementById('bengals-back-button').addEventListener('click', hideFullBengalsView);
    document.getElementById('bengals-widget').addEventListener('click', function(e) {
        if (!e.target.classList.contains('view-all') && !e.target.classList.contains('calendar-link')) {
            showFullBengalsView();
        }
    });

    // Set up event listeners for Transy Women's Basketball
    document.getElementById('view-all-transy').addEventListener('click', function(e) {
        e.stopPropagation();
        showFullTransyView();
    });
    document.getElementById('transy-back-button').addEventListener('click', hideFullTransyView);
    document.getElementById('transy-widget').addEventListener('click', function(e) {
        if (!e.target.classList.contains('view-all') && !e.target.classList.contains('calendar-link')) {
            showFullTransyView();
        }
    });

    // Set up event listeners for Calendar
    document.getElementById('view-all-calendar').addEventListener('click', function(e) {
        e.stopPropagation();
        showFullCalendarView();
    });
    document.getElementById('calendar-back-button').addEventListener('click', hideFullCalendarView);
    document.getElementById('outlook-widget').addEventListener('click', function(e) {
        if (!e.target.classList.contains('view-all') && !e.target.classList.contains('calendar-link') && 
            !e.target.classList.contains('action-button')) {
            showFullCalendarView();
        }
    });

    // Calendar integration event listeners
    document.getElementById('add-to-calendar').addEventListener('click', function(e) {
        e.stopPropagation();
        const nextGame = document.getElementById('next-basketball-game').textContent;
        const nextGameDate = document.getElementById('next-basketball-date').textContent;
        showCalendarConfirmModal('basketball', 
            `Add this event to your calendar:\n${nextGame}\n${nextGameDate}`);
    });
    
    document.getElementById('add-to-calendar-bengals').addEventListener('click', function(e) {
        e.stopPropagation();
        const nextGame = document.getElementById('next-bengals-game').textContent;
        const nextGameDate = document.getElementById('next-bengals-date').textContent;
        showCalendarConfirmModal('bengals', 
            `Add this event to your calendar:\n${nextGame}\n${nextGameDate}`);
    });
    
    document.getElementById('add-to-calendar-transy').addEventListener('click', function(e) {
        e.stopPropagation();
        const nextGame = document.getElementById('next-transy-game').textContent;
        const nextGameDate = document.getElementById('next-transy-date').textContent;
        showCalendarConfirmModal('transy', 
            `Add this event to your calendar:\n${nextGame}\n${nextGameDate}`);
    });
    
    document.getElementById('connect-outlook').addEventListener('click', function(e) {
        e.stopPropagation();
        showCalendarModal('outlook');
    });
    
    // Add event modal listeners
    document.getElementById('add-new-event').addEventListener('click', function(e) {
        e.stopPropagation();
        showAddEventModal();
    });
    
    document.getElementById('full-add-new-event').addEventListener('click', function(e) {
        e.stopPropagation();
        showAddEventModal();
    });
    
    // Quick add buttons for attendees
    document.getElementById('add-tim-btn').addEventListener('click', function() {
        addAttendeeEmail('hillt44@labcorp.com');
    });
    
    document.getElementById('add-ashley-btn').addEventListener('click', function() {
        addAttendeeEmail('ahill@transy.edu');
    });
    
    // Form submission
    document.getElementById('new-event-form').addEventListener('submit', function(e) {
        e.preventDefault();
        createNewEvent();
    });
    
    document.getElementById('confirm-add-to-calendar').addEventListener('click', addEventToOutlook);
    
    // Modal close buttons
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', function() {
            document.getElementById('calendar-modal').style.display = 'none';
            document.getElementById('add-event-modal').style.display = 'none';
            document.getElementById('calendar-confirm-modal').style.display = 'none';
        });
    });

    // Initialize MSAL if available
    if (typeof msal !== 'undefined') {
        try {
            window.msalInstance = new msal.PublicClientApplication(msalConfig);
            
            // Add this login redirect handler
            window.msalInstance.handleRedirectPromise().then(response => {
                // Handle successful login if response exists
                if (response) {
                    console.log("Login successful", response);
                    fetchCalendarEvents(response.account);
                }
            }).catch(error => {
                console.error("Error during redirect handling:", error);
            });
            
            // Check if user is already signed in
            const accounts = window.msalInstance.getAllAccounts();
            if (accounts.length > 0) {
                // User is already signed in, fetch calendar events
                fetchCalendarEvents(accounts[0]);
            }
        } catch (error) {
            console.error("Error initializing MSAL:", error);
        }
    }

    // Check for schedule updates every hour
    setInterval(checkForScheduleUpdates, 60 * 60 * 1000);
});

// Add attendee email to the form
function addAttendeeEmail(email) {
    const attendeesField = document.getElementById('event-attendees');
    const currentValue = attendeesField.value.trim();
    
    if (currentValue === '') {
        attendeesField.value = email;
    } else if (!currentValue.includes(email)) {
        attendeesField.value = currentValue + ', ' + email;
    }
}

// Initialize the calendar widget
function initializeCalendarWidget() {
    // Check if user is already authenticated
    if (typeof msal !== 'undefined') {
        const accounts = window.msalInstance?.getAllAccounts() || [];
        if (accounts.length > 0) {
            // User is already signed in, fetch calendar events
            fetchCalendarEvents(accounts[0]);
        } else {
            // Show connect prompt
            document.getElementById('calendar-events').innerHTML = `
                <div class="event-placeholder">
                    <div class="event-title">No events to display</div>
                    <div class="event-time">Connect your Microsoft account to view your calendar</div>
                </div>
            `;
        }
    } else {
        // MSAL not available
        document.getElementById('calendar-events').innerHTML = `
            <div class="event-placeholder">
                <div class="event-title">Microsoft Authentication Unavailable</div>
                <div class="event-time">Please check your internet connection</div>
            </div>
        `;
    }
}

// Fetch UK Basketball schedule from official sources
function fetchUKBasketballSchedule() {
    // In a real implementation, this would be an API call to UK Athletics or a sports data API
    
    // Based on search results, we have some confirmed games for 2024-2025
    const basketballData = {
        season: "2024-2025",
        record: {
            overall: "TBD",
            conference: "TBD"
        },
        games: [
            {
                opponent: "Duke Blue Devils",
                date: "November 12, 2024",
                location: "neutral", // "Catlanta"
                status: "Upcoming",
                time: "7:00 PM ET"
            },
            {
                opponent: "Gonzaga Bulldogs",
                date: "December 14, 2024",
                location: "away", // Seattle
                status: "Upcoming",
                time: "10:00 PM ET"
            },
            {
                opponent: "Ohio State Buckeyes",
                date: "December 21, 2024",
                location: "neutral", // MSG
                status: "Upcoming",
                time: "7:30 PM ET"
            },
            {
                opponent: "Florida Gators",
                date: "January 4, 2025",
                location: "home",
                status: "Upcoming",
                time: "11:00 AM ET"
            },
            {
                opponent: "Louisville Cardinals",
                date: "January 28, 2025",
                location: "home",
                status: "Upcoming",
                time: "8:00 PM ET"
            },
            {
                opponent: "Arkansas Razorbacks",
                date: "February 1, 2025",
                location: "home",
                status: "Upcoming",
                time: "9:00 PM ET"
            },
            {
                opponent: "Alabama Crimson Tide",
                date: "February 22, 2025",
                location: "away",
                status: "Upcoming",
                time: "6:00 PM ET"
            },
            {
                opponent: "Auburn Tigers",
                date: "March 1, 2025",
                location: "home",
                status: "Upcoming",
                time: "TBD"
            },
            {
                opponent: "LSU Tigers",
                date: "March 4, 2025",
                location: "home",
                status: "Upcoming",
                time: "TBD"
            }
        ]
    };
    
    // Cache the data
    localStorage.setItem('ukBasketballSchedule', JSON.stringify(basketballData));
    localStorage.setItem('ukBasketballScheduleTimestamp', new Date().getTime().toString());
    
    updateBasketballWidget(basketballData);
}

// Fetch Bengals schedule from official sources
function fetchBengalsSchedule() {
    // From search results, the 2024 NFL Draft just happened, but 2025-2026 schedule isn't out yet
    // The Bengals finished 2024-2025 season with a 9-8 record
    
    const bengalsData = {
        season: "2024-2025",
        record: {
            overall: "9-8",
            division: "3rd in AFC North"
        },
        scheduleAvailable: false,
        message: "The 2024-2025 NFL season has concluded. The 2025-2026 schedule will be announced in May.",
        lastGame: {
            opponent: "Pittsburgh Steelers",
            date: "Jan 7, 2025",
            result: "19-17 (W)"
        },
        // Known information about next season (teams they'll play but dates TBD)
        nextSeason: {
            season: "2025-2026",
            homeOpponents: [
                "Baltimore Ravens", 
                "Cleveland Browns", 
                "Pittsburgh Steelers", 
                "Houston Texans", 
                "Indianapolis Colts", 
                "New England Patriots", 
                "Chicago Bears", 
                "New Orleans Saints"
            ],
            awayOpponents: [
                "Baltimore Ravens", 
                "Cleveland Browns", 
                "Pittsburgh Steelers", 
                "Jacksonville Jaguars", 
                "Tennessee Titans", 
                "Denver Broncos", 
                "Detroit Lions", 
                "Tampa Bay Buccaneers"
            ]
        }
    };
    
    // Cache the data
    localStorage.setItem('bengalsSchedule', JSON.stringify(bengalsData));
    localStorage.setItem('bengalsScheduleTimestamp', new Date().getTime().toString());
    
    updateBengalsWidget(bengalsData);
}

// Fetch Transylvania Women's Basketball schedule
function fetchTransySchedule() {
    // Based on search results, using placeholder data for the 2024-2025 season
    const transyData = {
        season: "2024-2025",
        record: {
            overall: "TBD",
            conference: "TBD"
        },
        accomplishments: [
            "2023 NCAA DIII National Champions (33-0)",
            "Coach Juli Fulks - D3Hoops co-head coach of the year"
        ],
        games: [
            {
                opponent: "Centre College",
                date: "November 15, 2024",
                location: "home",
                status: "Upcoming",
                time: "7:00 PM ET"
            },
            {
                opponent: "Thomas More University",
                date: "November 23, 2024",
                location: "away",
                status: "Upcoming",
                time: "2:00 PM ET"
            },
            {
                opponent: "Hanover College",
                date: "December 7, 2024",
                location: "home",
                status: "Upcoming",
                time: "3:00 PM ET"
            },
            {
                opponent: "Mount St. Joseph",
                date: "December 14, 2024",
                location: "away",
                status: "Upcoming",
                time: "1:00 PM ET"
            },
            {
                opponent: "Rose-Hulman",
                date: "January 4, 2025",
                location: "home",
                status: "Upcoming",
                time: "1:00 PM ET"
            },
            {
                opponent: "Anderson University",
                date: "January 11, 2025",
                location: "away",
                status: "Upcoming",
                time: "3:00 PM ET"
            }
        ]
    };
    
    // Cache the data
    localStorage.setItem('transySchedule', JSON.stringify(transyData));
    localStorage.setItem('transyScheduleTimestamp', new Date().getTime().toString());
    
    updateTransyWidget(transyData);
}

// Update the basketball widget with the schedule data
function updateBasketballWidget(basketballData) {
    document.getElementById('basketball-season').textContent = `${basketballData.season} Season`;
    
    // Update the next game widget
    const nextGame = basketballData.games[0]; // First upcoming game
    
    // Update the widget content
    const locationText = nextGame.location === 'home' ? 'vs.' : 
                        nextGame.location === 'away' ? 'at' : 'vs.';
    
    document.getElementById('next-basketball-game').textContent = 
        `UK Wildcats ${locationText} ${nextGame.opponent}`;
    document.getElementById('next-basketball-date').textContent = 
        `${nextGame.date} | ${nextGame.time}`;
    document.getElementById('season-record').textContent = 
        `${basketballData.season} (Pre-season)`;
        
    // Populate all games in the full view
    const gamesList = document.getElementById('games-list');
    gamesList.innerHTML = ''; // Clear previous content
    
    basketballData.games.forEach(game => {
        const gameItem = document.createElement('div');
        gameItem.className = 'game-item';
        
        const locationText = game.location === 'home' ? 'vs.' : 
                            game.location === 'away' ? 'at' : 'vs.';
        
        gameItem.innerHTML = `
            <p class="game-title">UK Wildcats ${locationText} ${game.opponent}</p>
            <p class="game-date">${game.date} | ${game.time}</p>
            <div class="game-actions">
                <button class="add-game-calendar" data-team="uk" data-opponent="${game.opponent}" data-date="${game.date}" data-time="${game.time}" data-location="${game.location}">
                    Add to Calendar
                </button>
            </div>
        `;
        
        gamesList.appendChild(gameItem);
    });

    // Add event listeners to "Add to Calendar" buttons
    const calendarButtons = document.querySelectorAll('.add-game-calendar');
    calendarButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const gameData = {
                team: this.dataset.team,
                opponent: this.dataset.opponent,
                date: this.dataset.date,
                time: this.dataset.time,
                location: this.dataset.location
            };
            showCalendarConfirmModal('basketball', 
                `Add this event to your calendar:\nUK Wildcats ${gameData.location === 'home' ? 'vs.' : gameData.location === 'away' ? 'at' : 'vs.'} ${gameData.opponent}\n${gameData.date} | ${gameData.time}`);
        });
    });
}

// Update the Bengals widget with the schedule data
function updateBengalsWidget(bengalsData) {
    document.getElementById('bengals-season').textContent = `${bengalsData.season} Season`;
    
    // Update widget based on schedule availability
    if (!bengalsData.scheduleAvailable) {
        document.getElementById('next-bengals-game').textContent = "2025-2026 Season Preview";
        document.getElementById('next-bengals-date').textContent = bengalsData.message;
        document.getElementById('bengals-record').textContent = 
            `Final Record: ${bengalsData.record.overall}`;
        
        // Update the full view
        const gamesList = document.getElementById('bengals-games-list');
        gamesList.innerHTML = '';
        
        // Last game from completed season
        const lastGameItem = document.createElement('div');
        lastGameItem.className = 'game-item';
        lastGameItem.innerHTML = `
            <p class="game-title">Last Game: Cincinnati Bengals vs. ${bengalsData.lastGame.opponent}</p>
            <p class="game-date">${bengalsData.lastGame.date} | Final: ${bengalsData.lastGame.result}</p>
        `;
        gamesList.appendChild(lastGameItem);
        
        // Season complete message
        const seasonCompleteItem = document.createElement('div');
        seasonCompleteItem.className = 'game-item';
        seasonCompleteItem.innerHTML = `
            <p class="game-title">Season Complete</p>
            <p class="game-date">${bengalsData.message}</p>
            <p class="game-date">Final Record: ${bengalsData.record.overall} (${bengalsData.record.division})</p>
        `;
        gamesList.appendChild(seasonCompleteItem);
        
        // Next season home opponents
        const homeOpponentsItem = document.createElement('div');
        homeOpponentsItem.className = 'game-item';
        homeOpponentsItem.innerHTML = `
            <p class="game-title">2025-2026 Home Opponents</p>
            <p class="game-date">Dates and times TBD</p>
            <ul class="opponents-list">
                ${bengalsData.nextSeason.homeOpponents.map(team => `<li>${team}</li>`).join('')}
            </ul>
        `;
        gamesList.appendChild(homeOpponentsItem);
        
        // Next season away opponents
        const awayOpponentsItem = document.createElement('div');
        awayOpponentsItem.className = 'game-item';
        awayOpponentsItem.innerHTML = `
            <p class="game-title">2025-2026 Away Opponents</p>
            <p class="game-date">Dates and times TBD</p>
            <ul class="opponents-list">
                ${bengalsData.nextSeason.awayOpponents.map(team => `<li>${team}</li>`).join('')}
            </ul>
        `;
        gamesList.appendChild(awayOpponentsItem);
    } else {
        // This would handle if we had actual upcoming games
        // Not implemented since search showed season is over
    }
}

// Update the Transy widget with the schedule data
function updateTransyWidget(transyData) {
    document.getElementById('transy-season').textContent = `${transyData.season} Season`;
    
    // Update the next game widget
    const nextGame = transyData.games[0]; // First upcoming game
    
    // Update the widget content
    const locationText = nextGame.location === 'home' ? 'vs.' : 
                        nextGame.location === 'away' ? 'at' : 'vs.';
    
    document.getElementById('next-transy-game').textContent = 
        `Transy ${locationText} ${nextGame.opponent}`;
    document.getElementById('next-transy-date').textContent = 
        `${nextGame.date} | ${nextGame.time}`;
    document.getElementById('transy-record').textContent = 
        `${transyData.season} (Pre-season)`;
        
    // Populate all games in the full view
    const gamesList = document.getElementById('transy-games-list');
    gamesList.innerHTML = ''; // Clear previous content
    
    // Add championship note
    const championshipItem = document.createElement('div');
    championshipItem.className = 'game-item';
    championshipItem.innerHTML = `
        <p class="game-title">Defending National Champions</p>
        <p class="game-date">${transyData.accomplishments[0]}</p>
        <p class="game-date">${transyData.accomplishments[1]}</p>
    `;
    gamesList.appendChild(championshipItem);
    
    // Add games
    transyData.games.forEach(game => {
        const gameItem = document.createElement('div');
        gameItem.className = 'game-item';
        
        const locationText = game.location === 'home' ? 'vs.' : 
                            game.location === 'away' ? 'at' : 'vs.';
        
        gameItem.innerHTML = `
            <p class="game-title">Transy ${locationText} ${game.opponent}</p>
            <p class="game-date">${game.date} | ${game.time}</p>
            <div class="game-actions">
                <button class="add-game-calendar" data-team="transy" data-opponent="${game.opponent}" data-date="${game.date}" data-time="${game.time}" data-location="${game.location}">
                    Add to Calendar
                </button>
            </div>
        `;
        
        gamesList.appendChild(gameItem);
    });

    // Add event listeners to "Add to Calendar" buttons
    const calendarButtons = gamesList.querySelectorAll('.add-game-calendar');
    calendarButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const gameData = {
                team: this.dataset.team,
                opponent: this.dataset.opponent,
                date: this.dataset.date,
                time: this.dataset.time,
                location: this.dataset.location
            };
            showCalendarConfirmModal('transy', 
                `Add this event to your calendar:\nTransy ${gameData.location === 'home' ? 'vs.' : gameData.location === 'away' ? 'at' : 'vs.'} ${gameData.opponent}\n${gameData.date} | ${gameData.time}`);
        });
    });
}

// Fetch calendar events from Microsoft Graph API
function fetchCalendarEvents(account) {
    if (!window.msalInstance) {
        console.error("MSAL instance not available");
        return;
    }
    
    // Get access token for Microsoft Graph
    window.msalInstance.acquireTokenSilent({
        scopes: graphScopes,
        account: account
    }).then(response => {
        // Calculate date range for next 7 days
        const now = new Date();
        const endDate = new Date();
        endDate.setDate(now.getDate() + 7);
        
        const startDateTime = now.toISOString();
        const endDateTime = endDate.toISOString();
        
        // Call Microsoft Graph API to get calendar events
        fetch(`https://graph.microsoft.com/v1.0/me/calendarview?startDateTime=${startDateTime}&endDateTime=${endDateTime}&$top=10&$select=subject,start,end,location&$orderby=start/dateTime`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + response.accessToken,
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                throw new Error(data.error.message);
            }
            
            // Update the calendar widget with events
            updateCalendarWidget(data.value);
        })
        .catch(error => {
            console.error("Error fetching calendar events:", error);
            document.getElementById('calendar-events').innerHTML = `
                <div class="event-placeholder">
                    <div class="event-title">Error loading events</div>
                    <div class="event-time">${error.message}</div>
                </div>
            `;
        });
    }).catch(error => {
        // Handle token acquisition failure
        console.error("Error obtaining access token:", error);
        document.getElementById('calendar-events').innerHTML = `
            <div class="event-placeholder">
                <div class="event-title">Authentication Error</div>
                <div class="event-time">Please reconnect your Microsoft account</div>
            </div>
        `;
    });
}

// Update the calendar widget with events
function updateCalendarWidget(events) {
    const calendarEvents = document.getElementById('calendar-events');
    const fullCalendarEvents = document.getElementById('full-calendar-events');
    
    // Update event count
    document.getElementById('calendar-count').textContent = `Events: ${events.length}`;
    
    if (events.length === 0) {
        calendarEvents.innerHTML = `
            <div class="event-placeholder">
                <div class="event-title">No upcoming events</div>
                <div class="event-time">Your calendar is clear for the next 7 days</div>
            </div>
        `;
        
        fullCalendarEvents.innerHTML = `
            <div class="no-schedule">
                <p>No upcoming events in the next 7 days</p>
            </div>
        `;
        return;
    }
    
    // Clear previous content
    calendarEvents.innerHTML = '';
    fullCalendarEvents.innerHTML = '';
    
    // Show just the next 4 events in the widget
    const displayEvents = events.slice(0, 4);
    
    displayEvents.forEach(event => {
        const startDate = new Date(event.start.dateTime);
        const endDate = new Date(event.end.dateTime);
        
        const eventItem = document.createElement('div');
        eventItem.className = 'event-item';
        
        eventItem.innerHTML = `
            <div class="event-title">${event.subject}</div>
            <div class="event-time">${formatDateTime(startDate)} - ${formatTime(endDate)}</div>
            ${event.location.displayName ? `<div class="event-location">${event.location.displayName}</div>` : ''}
        `;
        
        calendarEvents.appendChild(eventItem);
    });
    
    // Show all events in the full view
    events.forEach(event => {
        const startDate = new Date(event.start.dateTime);
        const endDate = new Date(event.end.dateTime);
        
        const eventItem = document.createElement('div');
        eventItem.className = 'game-item';
        
        eventItem.innerHTML = `
            <p class="game-title">${event.subject}</p>
            <p class="game-date">${formatDateTime(startDate)} - ${formatTime(endDate)}</p>
            ${event.location.displayName ? `<p class="game-date">Location: ${event.location.displayName}</p>` : ''}
        `;
        
        fullCalendarEvents.appendChild(eventItem);
    });
}

// Create a new event from form data
function createNewEvent() {
    const title = document.getElementById('event-title').value;
    const date = document.getElementById('event-date').value;
    const startTime = document.getElementById('event-start-time').value;
    const endTime = document.getElementById('event-end-time').value;
    const location = document.getElementById('event-location').value;
    const attendees = document.getElementById('event-attendees').value;
    
    const eventData = {
        title,
        start: `${date}T${startTime}`,
        end: `${date}T${endTime}`,
        location,
        attendees: attendees.split(',').map(email => email.trim()).filter(email => email)
    };
    
    const statusElement = document.getElementById('event-status');
    statusElement.textContent = "Creating event...";
    
    if (!window.msalInstance) {
        statusElement.textContent = "Microsoft Authentication Library not available.";
        return;
    }
    
    // Check if user is signed in
    const accounts = window.msalInstance.getAllAccounts();
    if (accounts.length > 0) {
        // User is already signed in
        addNewEventToOutlook(accounts[0], eventData);
    } else {
        // User needs to sign in
        window.msalInstance.loginPopup({
            scopes: graphScopes,
            prompt: "select_account"
        }).then(response => {
            addNewEventToOutlook(response.account, eventData);
        }).catch(error => {
            console.error("Login error:", error);
            statusElement.textContent = "Authentication failed: " + error;
        });
    }
}

// Add a new event to Outlook calendar
function addNewEventToOutlook(account, eventData) {
    const statusElement = document.getElementById('event-status');
    
    // Get access token for Microsoft Graph
    window.msalInstance.acquireTokenSilent({
        scopes: graphScopes,
        account: account
    }).then(response => {
        // Format start and end times
        const startDateTime = new Date(eventData.start).toISOString();
        const endDateTime = new Date(eventData.end).toISOString();
        
        // Format attendees
        const attendees = eventData.attendees.map(email => ({
            emailAddress: {
                address: email
            },
            type: "required"
        }));
        
        // Create event in Outlook calendar using Microsoft Graph API
        const newEvent = {
            subject: eventData.title,
            start: {
                dateTime: startDateTime,
                timeZone: "Eastern Standard Time"
            },
            end: {
                dateTime: endDateTime,
                timeZone: "Eastern Standard Time"
            },
            location: {
                displayName: eventData.location
            },
            attendees: attendees.length > 0 ? attendees : []
        };
        
        // Call Microsoft Graph API to create event
        fetch('https://graph.microsoft.com/v1.0/me/events', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + response.accessToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newEvent)
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                throw new Error(data.error.message);
            }
            
            statusElement.textContent = "Event added to your calendar successfully!";
            
            // Close the modal after a delay and refresh calendar
            setTimeout(() => {
                document.getElementById('add-event-modal').style.display = 'none';
                fetchCalendarEvents(account);
            }, 2000);
        })
        .catch(error => {
            statusElement.textContent = "Error adding event to calendar: " + error.message;
        });
    }).catch(error => {
        // Handle token acquisition failure
        statusElement.textContent = "Error obtaining access token: " + error;
    });
}

// Show calendar modal for authentication
function showCalendarModal(sportType) {
    const modal = document.getElementById('calendar-modal');
    modal.style.display = 'block';
    
    // Store the sport type for use when connecting
    modal.dataset.sportType = sportType;
    
    // Update the modal title and button based on the type
    const modalTitle = document.querySelector('.modal-content h3');
    if (sportType === 'outlook') {
        modalTitle.textContent = "Connect to Outlook Calendar";
        document.getElementById('connect-outlook-btn').textContent = "Connect Account";
    } else {
        modalTitle.textContent = "Add to Outlook Calendar";
        document.getElementById('connect-outlook-btn').textContent = "Add Event";
    }
}

// Show calendar confirmation modal
function showCalendarConfirmModal(sportType, details) {
    const modal = document.getElementById('calendar-confirm-modal');
    modal.style.display = 'block';
    
    // Store the sport type for use when adding event
    modal.dataset.sportType = sportType;
    
    // Update the modal details
    document.getElementById('calendar-event-details').textContent = details;
}

// Show add event modal
function showAddEventModal() {
    // Set default date to today
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    document.getElementById('event-date').value = formattedDate;
    
    // Set default times (1 hour from now, for 1 hour)
    const startTime = new Date();
    startTime.setHours(startTime.getHours() + 1, 0, 0); // Next hour, 0 minutes
    
    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + 1); // 1 hour duration
    
    document.getElementById('event-start-time').value = startTime.toTimeString().slice(0, 5);
    document.getElementById('event-end-time').value = endTime.toTimeString().slice(0, 5);
    
    // Clear other fields
    document.getElementById('event-title').value = '';
    document.getElementById('event-location').value = '';
    document.getElementById('event-attendees').value = '';
    document.getElementById('event-status').textContent = '';
    
    // Show the modal
    document.getElementById('add-event-modal').style.display = 'block';
}

// Connect to Outlook and add event
function addEventToOutlook() {
    const statusElement = document.getElementById('confirm-status');
    statusElement.textContent = "Connecting to Outlook...";
    
    const modal = document.getElementById('calendar-confirm-modal');
    const sportType = modal.dataset.sportType;
    
    if (!window.msalInstance) {
        statusElement.textContent = "Microsoft Authentication Library not available.";
        return;
    }
    
    // Extract event details based on sport type
    let eventTitle, eventLocation, eventStart, eventEnd;
    
    // Get event details from the modal text
    const eventDetailsText = document.getElementById('calendar-event-details').textContent;
    const eventLines = eventDetailsText.split('\n');
    
    if (eventLines.length >= 3) {
        // Line 1: "Add this event to your calendar:"
        // Line 2: "Team vs. Opponent" or similar
        // Line 3: "Date | Time"
        
        eventTitle = eventLines[1].trim();
        
        // Parse date and time
        const dateTimeParts = eventLines[2].split('|');
        const dateString = dateTimeParts[0].trim();
        const timeString = dateTimeParts[1] ? dateTimeParts[1].trim() : '12:00 PM ET';
        
        let eventDate;
        try {
            eventDate = new Date(`${dateString} ${timeString}`);
            if (isNaN(eventDate)) {
                throw new Error("Invalid date");
            }
        } catch(e) {
            // If date parsing fails, use a fallback
            eventDate = new Date();
            eventDate.setDate(eventDate.getDate() + 14); // Two weeks in the future
            eventDate.setHours(19, 0, 0, 0); // 7:00 PM
        }
        
        // Add 3 hours for game duration
        const endDate = new Date(eventDate);
        endDate.setHours(endDate.getHours() + 3);
        
        eventStart = eventDate.toISOString();
        eventEnd = endDate.toISOString();
        
        // Set location based on sport type
        if (sportType === 'basketball') {
            eventLocation = 'Rupp Arena, Lexington, KY';
        } else if (sportType === 'bengals') {
            eventLocation = 'Paycor Stadium, Cincinnati, OH';
        } else if (sportType === 'transy') {
            eventLocation = 'Beck Center, Lexington, KY';
        } else {
            eventLocation = '';
        }
    } else {
        statusElement.textContent = "Error parsing event details.";
        return;
    }
    
    // Check if user is signed in
    const accounts = window.msalInstance.getAllAccounts();
    if (accounts.length > 0) {
        // User is already signed in
        addSportEventToOutlook(accounts[0], eventTitle, eventStart, eventEnd, eventLocation);
    } else {
        // User needs to sign in
        window.msalInstance.loginPopup({
            scopes: graphScopes,
            prompt: "select_account"
        }).then(response => {
            addSportEventToOutlook(response.account, eventTitle, eventStart, eventEnd, eventLocation);
        }).catch(error => {
            console.error("Login error:", error);
            statusElement.textContent = "Authentication failed: " + error;
        });
    }
}

// Add sport event to Outlook calendar
function addSportEventToOutlook(account, title, start, end, location) {
    const statusElement = document.getElementById('confirm-status');
    
    // Get access token for Microsoft Graph
    window.msalInstance.acquireTokenSilent({
        scopes: graphScopes,
        account: account
    }).then(response => {
        // Create event in Outlook calendar using Microsoft Graph API
        const newEvent = {
            subject: title,
            start: {
                dateTime: start,
                timeZone: "Eastern Standard Time"
            },
            end: {
                dateTime: end,
                timeZone: "Eastern Standard Time"
            },
            location: {
                displayName: location
            }
        };
        
        // Call Microsoft Graph API to create event
        fetch('https://graph.microsoft.com/v1.0/me/events', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + response.accessToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newEvent)
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                throw new Error(data.error.message);
            }
            
            statusElement.textContent = "Event added to your calendar successfully!";
            
            // Close the modal after a delay
            setTimeout(() => {
                document.getElementById('calendar-confirm-modal').style.display = 'none';
                // Refresh calendar if connected
                const accounts = window.msalInstance.getAllAccounts();
                if (accounts.length > 0) {
                    fetchCalendarEvents(accounts[0]);
                }
            }, 2000);
        })
        .catch(error => {
            statusElement.textContent = "Error adding event to calendar: " + error.message;
        });
    }).catch(error => {
        // Handle token acquisition failure
        statusElement.textContent = "Error obtaining access token: " + error;
    });
}

// Show the full basketball view
function showFullBasketballView() {
    document.getElementById('basketball-full-view').style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevent scrolling of the background
}

// Hide the full basketball view
function hideFullBasketballView() {
    document.getElementById('basketball-full-view').style.display = 'none';
    document.body.style.overflow = 'auto'; // Re-enable scrolling
}

// Show the full Bengals view
function showFullBengalsView() {
    document.getElementById('bengals-full-view').style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevent scrolling of the background
}

// Hide the full Bengals view
function hideFullBengalsView() {
    document.getElementById('bengals-full-view').style.display = 'none';
    document.body.style.overflow = 'auto'; // Re-enable scrolling
}

// Show the full Transy view
function showFullTransyView() {
    document.getElementById('transy-full-view').style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevent scrolling of the background
}

// Hide the full Transy view
function hideFullTransyView() {
    document.getElementById('transy-full-view').style.display = 'none';
    document.body.style.overflow = 'auto'; // Re-enable scrolling
}

// Show the full calendar view
function showFullCalendarView() {
    document.getElementById('calendar-full-view').style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevent scrolling of the background
}

// Hide the full calendar view
function hideFullCalendarView() {
    document.getElementById('calendar-full-view').style.display = 'none';
    document.body.style.overflow = 'auto'; // Re-enable scrolling
}

// Format date and time for display
function formatDateTime(date) {
    const options = { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    };
    return date.toLocaleDateString('en-US', options);
}

// Format just time for display
function formatTime(date) {
    const options = { 
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    };
    return date.toLocaleTimeString('en-US', options);
}

// Function to check for schedule updates
function checkForScheduleUpdates() {
    const basketballTimestamp = localStorage.getItem('ukBasketballScheduleTimestamp');
    const bengalsTimestamp = localStorage.getItem('bengalsScheduleTimestamp');
    const transyTimestamp = localStorage.getItem('transyScheduleTimestamp');
    const currentTime = new Date().getTime();
    
    // Check if cache is older than 24 hours
    if (!basketballTimestamp || (currentTime - basketballTimestamp > 24 * 60 * 60 * 1000)) {
        fetchUKBasketballSchedule();
    }
    
    if (!bengalsTimestamp || (currentTime - bengalsTimestamp > 24 * 60 * 60 * 1000)) {
        fetchBengalsSchedule();
    }
    
    if (!transyTimestamp || (currentTime - transyTimestamp > 24 * 60 * 60 * 1000)) {
        fetchTransySchedule();
    }
    
    // Also update calendar if user is connected
    if (window.msalInstance) {
        const accounts = window.msalInstance.getAllAccounts();
        if (accounts.length > 0) {
            fetchCalendarEvents(accounts[0]);
        }
    }
}