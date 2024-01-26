"use strict";
const myLeads = [];
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

		const listItem = document.createElement("li");
		listItem.innerHTML = `<a ${newURL ? `target="_blank" href="${newURL}"` : ""}>${newName}</a> (Contacted: ${
			isContacted ? "Yes" : "No"
		}) Notes: ${newNotes}`;
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
		case "1" || "":
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

leadForm.addEventListener("submit", function (event) {
	event.preventDefault();
});

inputBtn.addEventListener("click", function (event) {
	event.preventDefault();
	saveInput();
});

downloadBtn.addEventListener("click", downloadLeads);
clearBtn.addEventListener("click", clearData);
