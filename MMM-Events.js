/* Magic Mirror
 * Module: MMM-Events
 *
 * By Mykle1 -  Brometheus #1 consultant and all around good dude!
 *
 */
Module.register("MMM-Events", {

    // Module config defaults.
    defaults: {
        city: "New York",              // Your City
	eventType: "music",            // See Events List in ReadMe
	when: "Next week",             // "All", "Future", "Past", "Today", "Last Week", "This Week", "Next week", and months by name, e.g. "October"
        mode: "noFrame",               // Frame or noFrame (around picture)
        apikey: "Your FREE API Key Goes Here",
	rotateInterval: 5 * 60 * 1000, // New Event Appears
	useHeader: false,
        header: "",
	maxWidth: "195px",             // adjust to your liking 
	animationSpeed: 3000,          // Event fades in and out
        initialLoadDelay: 4250,
        retryDelay: 2500,
	updateInterval: 60 * 60 * 1000, // 60 minutes. No need to change!
	picture: true,                  // true, false = no picture
    },

    getStyles: function() {
        return ["MMM-Events.css"];
    },

    start: function() {
        Log.info("Starting module: " + this.name);

        requiresVersion: "2.1.0",

        // Set locale.
        this.url = this.getEventsUrl();
        this.event = {};
        this.activeItem = 0;
        this.rotateInterval = null;
        this.scheduleUpdate();
    },

    getDom: function() {

        var wrapper = document.createElement("div");
        wrapper.className = "wrapper";
        wrapper.style.maxWidth = this.config.maxWidth;

        if (!this.loaded) {
            wrapper.innerHTML = "Upcoming Events...";
            wrapper.classList.add("bright", "light", "small");
            return wrapper;
        }

        if (this.config.useHeader != false) {
            var header = document.createElement("header");
            header.classList.add("xsmall", "bright");
            header.innerHTML = "Events for " + this.config.city;
            wrapper.appendChild(header);
        }

        
        var keys = Object.keys(this.event);
        if (keys.length > 0) {
            if (this.activeItem >= keys.length) {
                this.activeItem = 0;
            }

           
            var events = this.event[keys[this.activeItem]];
            var top = document.createElement("div");
            top.classList.add("list-row");

            
            var eventsDate1 = document.createElement("div");
            eventsDate1.classList.add("small", "bright");
            eventsDate1.innerHTML = events.title;
            wrapper.appendChild(eventsDate1);

            
		if (this.config.picture === true) {	
				var eventsLogo = document.createElement("div");
				var eventsIcon = document.createElement("img");
				eventsIcon.classList.add("list-left", "photo"); 

			
		if (this.config.mode === "noFrame") {	    
			if (events.image != null) {
			eventsIcon.src = events.image.perspectivecrop176by124.url;
		} else {
			eventsIcon.src = "modules/MMM-Events/icons/go.jpg"; 
		}
			eventsLogo.appendChild(eventsIcon);
					wrapper.appendChild(eventsLogo);	
		} else {
			if (events.image != null) {
			eventsIcon.src = events.image.dropshadow170.url;
		} else {
			eventsIcon.src = "modules/MMM-Events/icons/go.jpg"; 
		} 
					eventsLogo.appendChild(eventsIcon);
			wrapper.appendChild(eventsLogo);
		} 
				
		}	
           

            var eventsDate2 = document.createElement("div");
            eventsDate2.classList.add("xsmall", "bright", "list-title");
            eventsDate2.innerHTML = events.venue_name;
            wrapper.appendChild(eventsDate2);

           
            var eventsDate4 = document.createElement("div");
            eventsDate4.classList.add("xsmall", "bright", "list-title");

           
            eventsDate4.innerHTML = events.venue_address;
            wrapper.appendChild(eventsDate4);

            
            var now = new Date(events.start_time);
            var date = now.toLocaleDateString();
            var time = now.toLocaleTimeString(navigator.language, {
                hour: '2-digit',
                minute: '2-digit'
            });

            
            var eventsDate3 = document.createElement("div");
            eventsDate3.classList.add("xsmall", "bright", "list-title");
            if (time != "12:00 AM") {
                eventsDate3.innerHTML = "Date: " + date + "<br> Time: " + time;
            } else {
                eventsDate3.innerHTML = "Date: " + date + "<br> Time: To Be Determined";
            }
            wrapper.appendChild(eventsDate3);

        }
        return wrapper;
    },
	
/////  Add this function to the modules you want to control with voice //////

    notificationReceived: function(notification, payload) {
        if (notification === 'HIDE_EVENTS') {
            this.hide(1000);
        //    this.updateDom(300);
        }  else if (notification === 'SHOW_EVENTS') {
            this.show(1000);
        //   this.updateDom(300);
        }
            
    },
	

    processEvents: function(data) {
        this.event = data.event;
        this.perform = data.performers;
        this.loaded = true;
    },

    scheduleCarousel: function() {
        console.log("Scheduling Events");
        this.rotateInterval = setInterval(() => {
            this.activeItem++;
            this.updateDom(this.config.animationSpeed);
        }, this.config.rotateInterval);
    },

    scheduleUpdate: function() {
        setInterval(() => {
            this.getEvents();
        }, this.config.updateInterval);
        this.getEvents(this.config.initialLoadDelay);
        var self = this;
    },

    getEventsUrl: function() {

        var url = null;
        var mode = this.config.mode;
        var today = new Date();
        var eventsYear = today.getMonth() + 1;
        var city = this.config.city.toLowerCase();
        var apikey = this.config.apikey;
		var eventType = this.config.eventType;
		var when = this.config.when;

       
        if (mode == "Frame") {
            url = "http://api.eventful.com/json/events/search?app_key=" + apikey + "&location=" + city + "&date=" + when + "&category=" + eventType + "&sort_order=popularity&sort_direction=descending&page_size=50&image_sizes=dropshadow170";
        } else {
            url = "http://api.eventful.com/json/events/search?app_key=" + apikey + "&location=" + city + "&date=" + when + "&category=" + eventType + "&sort_order=popularity&sort_direction=descending&page_size=50&image_sizes=perspectivecrop176by124";
        }
        return url;
    },

    getEvents: function() {
        this.sendSocketNotification('GET_EVENTS', this.url);
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === "EVENTS_RESULT") {
            this.processEvents(payload);
            if (this.rotateInterval == null) {
                this.scheduleCarousel();
            }
            this.updateDom(this.config.animationSpeed);
        }
        this.updateDom(this.config.initialLoadDelay);
    },
});
