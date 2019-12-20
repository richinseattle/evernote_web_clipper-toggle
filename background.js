var scheduledTimeout = null;
var EVERNOTE_ID = "pioclpoplcdbaefihamjohnefbikjilc";


function fetchState() {
	chrome.management.get(EVERNOTE_ID, function(extensionInfo) {
		if(extensionInfo.enabled) {
			chrome.browserAction.setIcon({path:"icon-red.png"});
		} else {
			chrome.browserAction.setIcon({path:"icon-grey-green.png"});
		}
	});
}
function removeTimeout() {
	try {
		if(scheduledTimeout != null) {
			clearTimeout(scheduledTimeout);
			scheduledTimeout = null;
		}
	} catch(err) {}
}
function showNotification() {
	chrome.management.get(EVERNOTE_ID, function(extensionInfo) {
		if(extensionInfo.enabled) {
			chrome.notifications.create("evernote-toggle", {
				type: 'basic',
				title: 'Evernote is enabled',
				message: 'Tap to disable Evernote',
				iconUrl: 'icon-grey-green.png'
			}, null);
			
			chrome.notifications.onClicked.addListener(function() {
				chrome.management.setEnabled(EVERNOTE_ID, false);
				fetchState();
				chrome.notifications.clear("evernote-toggle")
			});
		}
	});
}


function toggleEvernoteState() {
	chrome.management.get(EVERNOTE_ID, function(extensionInfo) {
		var wasEnabled = extensionInfo.enabled;
		
		if(!wasEnabled) {
			// Disable the extension again after 1 minute
			scheduledTimeout = setTimeout(function() { 
				showNotification(); 
				removeTimeout();
			}, 60 * 1000);	
		}
		// Toggle state
		chrome.management.setEnabled(EVERNOTE_ID, !wasEnabled, function() {
			if(!wasEnabled) {
				// Evernote was just enabled, reload the current tab
				chrome.tabs.query({active: true, currentWindow: true}, function (arrayOfTabs) {
					chrome.tabs.reload(arrayOfTabs[0].id);
				});
			}
		});
		fetchState();
	});
	
	// Clear any set timeouts
	removeTimeout();
}

chrome.browserAction.onClicked.addListener(toggleEvernoteState);
fetchState();
