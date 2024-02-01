"use strict";
let myLeads = [];
const listItem = document.createElement("li");
const editButton = document.createElement("button");
const deleteButton = document.createElement("button");
editButton.textContent = "Edit";
editButton.className = "modifyBtn";
deleteButton.textContent = "Delete";
deleteButton.className = "modifyBtn";
const leadNotes = document.getElementById("leadNotes");
const leadForm = document.getElementById("leadForm");
const inputBtn = document.getElementById("input-btn");
const leadName = document.getElementById("leadName");
const leadURL = document.getElementById("leadURL");
const contactedCheckbox = document.getElementById("contactedCheckbox");
const savedLeads = document.getElementById("savedLeadsDisplay");
const downloadBtn = document.getElementById("downloadBtn");
// const clearBtn = document.getElementById("clearBtn");
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

// function clearData() {
// 	myLeads.length = 0;
// 	savedLeads.innerHTML = "";
// 	leadName.value = "";
// 	leadURL.value = "";
// 	leadNotes.value = "";
// 	contactedCheckbox.checked = false;
// }

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
// clearBtn.addEventListener("click", clearData);

function editLead(lead, listItem) {
	// Create input fields for editing lead details
	const nameInput = document.createElement("input");
	nameInput.type = "text";
	nameInput.value = lead.name;

	const urlInput = document.createElement("input");
	urlInput.type = "text";
	urlInput.value = lead.url;

	const notesInput = document.createElement("input");
	notesInput.type = "text";
	notesInput.value = lead.notes;

	const contactedCheckboxInput = document.createElement("input");
	contactedCheckboxInput.type = "checkbox";
	contactedCheckboxInput.checked = lead.contacted;

	const saveEditedLead = document.createElement("button");
	saveEditedLead.className = "modifyBtn";
	saveEditedLead.textContent = "save";

	// Replace the text content of the lead item with input fields
	listItem.innerHTML = "";
	listItem.appendChild(nameInput);
	listItem.appendChild(urlInput);
	listItem.appendChild(notesInput);
	listItem.appendChild(contactedCheckboxInput);
	listItem.appendChild(saveEditedLead);

	// Change the onclick event of the save button to update lead details
	saveEditedLead.onclick = function () {
		const newName = nameInput.value.trim();
		const newURL = urlInput.value.trim();
		const newNotes = notesInput.value.trim();
		const newContacted = contactedCheckboxInput.checked;

		// Check if any required field is empty
		if (!newName || !newURL) {
			alert("Please fill in all required fields (Lead Name and Lead URL).");
			return;
		}

		// Update lead object with new values
		lead.name = newName;
		lead.url = newURL;
		lead.notes = newNotes;
		lead.contacted = newContacted;

		// Update the myLeads array in local storage
		localStorage.setItem("myLeads", JSON.stringify(myLeads));

		// Update the display of the edited lead
		listItem.innerHTML = `<a ${lead.url ? `target="_blank" href="${lead.url}"` : ""}>${lead.name}</a> (Contacted: ${
			lead.contacted ? "Yes" : "No"
		}) Notes: ${lead.notes}`;

		// Append edit and delete buttons with functionality to the edited lead
		const editButton = document.createElement("button");
		editButton.textContent = "Edit";
		editButton.className = "modifyBtn";
		editButton.addEventListener("click", function () {
			editLead(lead, listItem);
		});

		const deleteButton = document.createElement("button");
		deleteButton.textContent = "Delete";
		deleteButton.className = "modifyBtn";
		deleteButton.addEventListener("click", function () {
			deleteLead(lead, myLeads.indexOf(lead));
			listItem.remove();
		});

		listItem.appendChild(editButton);
		listItem.appendChild(deleteButton);
	};
}

function deleteLead(lead, index) {
	myLeads.splice(index, 1);
	localStorage.setItem("myLeads", JSON.stringify(myLeads));
}

function saveInput() {
	if (leadName.value != "" && leadURL.value != "") {
		const newName = leadName.value;
		const newURL = leadURL.value;
		const newNotes = leadNotes.value;
		const isContacted = contactedCheckbox.checked;

		const newLead = new Lead(newName, newURL, newNotes, isContacted);
		myLeads.push(newLead);
		const myLeadsJSON = JSON.stringify(myLeads);

		// Store the JSON string in local storage
		localStorage.setItem("myLeads", myLeadsJSON);

		editButton.addEventListener("click", function () {
			editLead(newLead, listItem);
		});

		deleteButton.addEventListener("click", function () {
			deleteLead(newLead, myLeads.indexOf(newLead));
			listItem.remove();
		});

		listItem.innerHTML = `<a ${newLead.url ? `target="_blank" href="${newLead.url}"` : ""}>${
			newLead.name
		}</a> (Contacted: ${newLead.contacted ? "Yes" : "No"}) Notes: ${newLead.notes}`;

		listItem.appendChild(deleteButton);
		listItem.appendChild(editButton);

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

function loadSavedLeads() {
	savedLeads.innerHTML = "";
	for (let i = 0; i < myLeads.length; i++) {
		const leadItem = document.createElement("li");
		const lead = myLeads[i];
		const editButton = document.createElement("button");
		const deleteButton = document.createElement("button");

		editButton.textContent = "Edit";
		editButton.className = "modifyBtn";
		deleteButton.textContent = "Delete";
		deleteButton.className = "modifyBtn";

		editButton.addEventListener("click", function () {
			editLead(lead, leadItem);
		});

		deleteButton.addEventListener("click", function () {
			deleteLead(lead, i);
			leadItem.remove();
		});

		leadItem.innerHTML = `<a ${lead.url ? `target="_blank" href="${lead.url}"` : ""}>${lead.name}</a> (Contacted: ${
			lead.contacted ? "Yes" : "No"
		}) Notes: ${lead.notes}`;

		leadItem.appendChild(deleteButton);
		leadItem.appendChild(editButton);

		savedLeads.appendChild(leadItem);
	}
}
