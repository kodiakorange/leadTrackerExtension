"use strict";
let myLeads = [];
const inputBtn = document.getElementById("input-btn");
const inputField = document.getElementById("input-el");
const savedLeads = document.getElementById("savedLeadsDisplay");
const leadForm = document.getElementById("leadForm");
const downloadBtn = document.getElementById("downloadBtn");
const clearBtn = document.getElementById("clearBtn");
const today = new Date();
const month = today.getMonth() + 1;
const day = today.getDay();
const year = today.getFullYear();
const mdyString = month + "-" + day + "-" + year + " ";

function saveInput() {
	const newLead = inputField.value;
	myLeads.push(newLead);
	const listItem = document.createElement("li");
	listItem.textContent = newLead;
	savedLeads.appendChild(listItem);
	inputField.value = "";
}

function clearData() {
	location.reload();
}

function downloadLeads() {
	alert("This will download a .txt file with your current leadlist");
	const blob = new Blob([myLeads.join("\n")], { type: "text/plain" });
	const downloadLink = document.createElement("a");
	downloadLink.href = URL.createObjectURL(blob);
	downloadLink.download = mdyString + "leads.txt"; // File name for the download

	// Append the link to the document
	document.body.appendChild(downloadLink);

	// Trigger a click on the link to start the download
	downloadLink.click();

	// Remove the link from the document
	document.body.removeChild(downloadLink);
}

leadForm.addEventListener("submit", function (event) {
	event.preventDefault();
	saveInput();
});

downloadBtn.addEventListener("click", downloadLeads);
clearBtn.addEventListener("click", clearData);
