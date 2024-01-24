"use strict";
const myLeads = [];
const inputBtn = document.getElementById("input-btn");
const leadName = document.getElementById("leadName"); // New lead name input field
const leadURL = document.getElementById("leadURL");
const contactedCheckbox = document.getElementById("contactedCheckbox");
const savedLeads = document.getElementById("savedLeadsDisplay");
const downloadBtn = document.getElementById("downloadBtn");
const clearBtn = document.getElementById("clearBtn");

const today = new Date();
const month = today.getMonth() + 1;
const day = today.getDate();
const year = today.getFullYear();
const mdyString = `${month}-${day}-${year} `;

function Lead(name, url, contacted) {
	this.name = name;
	this.url = url;
	this.contacted = contacted || false;
}

function saveInput() {
	const newName = leadName.value; // Read the value from the lead name input field
	const newURL = leadURL.value;
	const isContacted = contactedCheckbox.checked;

	myLeads.push(new Lead(newName, newURL, isContacted));

	const listItem = document.createElement("li");
	listItem.innerHTML = `<a target="_blank" href="${newURL}">${newName}</a> (Contacted: ${
		isContacted ? "Yes" : "No"
	})`;
	savedLeads.appendChild(listItem);

	leadName.value = ""; // Reset lead name input field
	leadURL.value = "";
	contactedCheckbox.checked = false;
}

function clearData() {
	myLeads.length = 0;
	savedLeads.innerHTML = "";
	leadName.value = "";
	leadURL.value = "";
	contactedCheckbox.checked = false;
}

function downloadLeads() {
	const confirmDownload = confirm("This will download a .txt file with your current lead list. Continue?");
	if (confirmDownload) {
		const blob = new Blob(
			[
				myLeads
					.map((lead) => `${lead.name} - ${lead.url} (Contacted: ${lead.contacted ? "Yes" : "No"})`)
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

leadForm.addEventListener("submit", function (event) {
	event.preventDefault();
	saveInput();
});

// Prevent form submission on Enter key press
leadForm.addEventListener("keypress", function (event) {
	if (event.key === "Enter") {
		event.preventDefault();
	}
});

downloadBtn.addEventListener("click", downloadLeads);
clearBtn.addEventListener("click", clearData);
