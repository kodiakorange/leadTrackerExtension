"use strict";

//CREATE AN EDIT BUTTON FOR ENTRIES!!!
//CREATE A DELETE BUTTON FOR ENTRIES!!!!
//Should show input fields to set name, url, notes, contacted,
//for each entry saved, i should add the lead object to localstorage.
let myLeads = [];
const listItem = document.createElement("li");
const leadNotes = document.getElementById("leadNotes");
const leadForm = document.getElementById("leadForm");
const inputBtn = document.getElementById("input-btn");
const leadName = document.getElementById("leadName");
const leadURL = document.getElementById("leadURL");
const contactedCheckbox = document.getElementById("contactedCheckbox");
const savedLeads = document.getElementById("savedLeadsDisplay");
const downloadBtn = document.getElementById("downloadBtn");
const clearBtn = document.getElementById("clearBtn");
const followUpDateInput = document.getElementById("followUpDate");

const today = new Date();
const month = today.getMonth() + 1;
const day = today.getDate();
const year = today.getFullYear();
const mdyString = `${month}-${day}-${year} `;
leadForm.addEventListener("keypress", function (event) {
	if (event.key === "Enter") {
		event.preventDefault();
	}
});

function Lead(name, url, notes, contacted) {
	this.name = name;
	this.url = url;
	this.notes = notes;
	this.contacted = contacted || false;
}

function saveInput() {
	if (leadName.value != "" && leadURL.value != "") {
		const newName = leadName.value;
		const newURL = leadURL.value;
		const newNotes = leadNotes.value;
		const isContacted = contactedCheckbox.checked;

		myLeads.push(new Lead(newName, newURL, newNotes, isContacted));
		const myLeadsJSON = JSON.stringify(myLeads);

		// Store the JSON string in local storage
		localStorage.setItem("myLeads", myLeadsJSON);

		const listItem = document.createElement("li");
		const deleteButton = document.createElement("button");
		deleteButton.textContent = "Delete";

		// Get the index of the current entry
		const index = myLeads.length - 1;

		deleteButton.addEventListener("click", function () {
			// Remove the corresponding entry from the myLeads array
			myLeads.splice(index, 1);

			// Update the local storage with the modified array
			localStorage.setItem("myLeads", JSON.stringify(myLeads));

			// Remove the listItem from the DOM
			listItem.remove();
		});

		listItem.innerHTML = `<a ${newURL ? `target="_blank" href="${newURL}"` : ""}>${newName}</a> (Contacted: ${
			isContacted ? "Yes" : "No"
		}) Notes: ${newNotes}`;

		// Append the delete button to the listItem
		listItem.appendChild(deleteButton);

		savedLeads.appendChild(listItem);

		leadName.value = "";
		leadURL.value = "";
		leadNotes.value = "";
		contactedCheckbox.checked = false;

		if (followUpDateInput.value != "") {
			const createFollowUp = confirm("Would you like to create a follow-up reminder?");
			if (createFollowUp) {
				createFollowUpEvent();
			}
		}
	}
}

function clearData() {
	myLeads.length = 0;
	savedLeads.innerHTML = "";
	leadName.value = "";
	leadURL.value = "";
	leadNotes.value = "";
	contactedCheckbox.checked = false;
}

function downloadLeads() {
	const confirmDownload = confirm("This will download a .txt file with your current lead list. Continue?");
	if (confirmDownload) {
		const blob = new Blob(
			[
				myLeads
					.map(
						(lead) =>
							`${lead.name} - ${lead.url} - Notes: ${lead.notes}. (Contacted: ${
								lead.contacted ? "Yes" : "No"
							}) `
					)
					.join("\n"),
			],
			{ type: "text/plain" }
		);
		const downloadLink = document.createElement("a");
		downloadLink.href = URL.createObjectURL(blob);
		downloadLink.download = mdyString + "leads.txt";
		document.body.appendChild(downloadLink);
		downloadLink.click();
		document.body.removeChild(downloadLink);
	}
}

// Function to create Google Calendar link
function createGoogleCalendarLink(leads) {
	const googleCalendarURL = "https://www.google.com/calendar/render?action=TEMPLATE";
	const params = leads
		.map(
			(lead) =>
				`text=${encodeURIComponent(`Follow up with ${lead.name}`)}&details=${encodeURIComponent(
					`URL: ${lead.url}\nContacted: ${lead.contacted ? "Yes" : "No"}\nNotes: ${lead.notes}`
				)}`
		)
		.join("&");
	return `${googleCalendarURL}&${params}`;
}

// Function to create Outlook link
function createOutlookLink(leads) {
	const outlookURL = "https://outlook.live.com/calendar/0/deeplink/compose";
	const params = leads
		.map(
			(lead) =>
				`subject=${encodeURIComponent(`Follow up with ${lead.name}`)}&body=${encodeURIComponent(
					`URL: ${lead.url}\nContacted: ${lead.contacted ? "Yes" : "No"}\nNotes: ${lead.notes}`
				)}`
		)
		.join("&");
	return `${outlookURL}?${params}`;
}

// Function to create iCal link
function createICalLink(leads) {
	const iCalURL = "data:text/calendar;charset=utf-8,";
	const iCalContent = leads
		.map(
			(lead) =>
				`BEGIN:VEVENT
SUMMARY:Follow up with ${lead.name}
DESCRIPTION:URL: ${lead.url}\\nContacted: ${lead.contacted ? "Yes" : "No"}\\nNotes: ${lead.notes}
END:VEVENT`
		)
		.join("\n");
	return `${iCalURL}${encodeURIComponent(iCalContent)}`;
}

function createFollowUpEvent() {
	const followUpDate = followUpDateInput.value;

	let downloadOption = prompt("Choose the calendar you would like to use:\n1. Google Calendar\n2. iCal\n3. Outlook");

	if (!downloadOption) {
		return; // User canceled the prompt
	}

	let downloadLink;

	switch (downloadOption) {
		case "1":
			downloadLink = createGoogleCalendarLink(myLeads, followUpDate);
			break;
		case "2":
			downloadLink = createICalLink(myLeads, followUpDate);
			break;
		case "3":
			downloadLink = createOutlookLink(myLeads, followUpDate);
			break;
		default:
			alert("Invalid option selected");
			return;
	}

	if (downloadLink) {
		// Open the generated link in a new window with specific characteristics
		window.open(downloadLink, "CalendarEvent", "max-width: 400px");
	}
}
// Function to check local storage on page load
function checkLocalStorage() {
	// Retrieve data from local storage
	let myLeadsJSON = localStorage.getItem("myLeads");

	// If data exists in local storage
	if (myLeadsJSON) {
		// Parse the JSON string back into an array
		myLeads = JSON.parse(myLeadsJSON);
		loadSavedLeads();

		// Now you can use the myLeads array as needed, for example:
		// renderLeads(); // Function to render leads from myLeads array
	}
}

// Event listener for page load
window.addEventListener("load", checkLocalStorage);

leadForm.addEventListener("submit", function (event) {
	event.preventDefault();
});

inputBtn.addEventListener("click", function (event) {
	event.preventDefault();
	saveInput();
});

downloadBtn.addEventListener("click", downloadLeads);
clearBtn.addEventListener("click", clearData);

function loadSavedLeads() {
	for (let i = 0; i < myLeads.length; i++) {
		const listItem = document.createElement("li");

		listItem.innerHTML = `<a ${myLeads[i].url ? `target="_blank" href="${myLeads[i].url}"` : ""}>${
			myLeads[i].name
		}</a> (Contacted: ${myLeads[i].contacted ? "Yes" : "No"}) Notes: ${myLeads[i].notes}`;

		// Create a delete button for each entry
		const deleteButton = document.createElement("button");
		deleteButton.textContent = "Delete";
		deleteButton.id = "deleteBtn";

		// Get the index of the current entry
		const index = i;

		deleteButton.addEventListener("click", function () {
			// Remove the corresponding entry from the myLeads array
			myLeads.splice(index, 1);

			// Update the local storage with the modified array
			localStorage.setItem("myLeads", JSON.stringify(myLeads));

			// Remove the listItem from the DOM
			listItem.remove();
		});

		// Append the delete button to the listItem
		listItem.appendChild(deleteButton);

		// Append the listItem to the savedLeads
		savedLeads.appendChild(listItem);
	}
}
