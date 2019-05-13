/*
* Copyright 2019 Ntech developers
* This code contains all validations carried out for data to and fro the backend
* All form validations are found here
*/

//dependencies : jquery, jquery-dajax, util.js

function calculate_strength() {
    const strength = password_strength($(this).val()).toString();
    document.getElementById("strength-bar").style.width = strength + "%";
    $("#strength-val").text(strength + " %")
}

const password_input = $("#password");
password_input.keyup(calculate_strength);
password_input.change(calculate_strength);

$("#institution").change(function () {
    console.log("yeah");
    if ($(this).val().trim().toLowerCase() !== "select institution") {
        $("#new_institution").prop("disabled", true);
    } else {
        $("#new_institution").prop("disabled", false);
    }
});

function calculateAge(birthday) {
    // birthday is a date
    let ageDifMs = Date.now() - birthday.getTime();
    let ageDate = new Date(ageDifMs);
    // milliseconds from epoch
    return Math.abs(ageDate.getUTCFullYear() - 1970);
}

$("#dob").change(function () {
    let dob = new Date($(this).val());
    if (dob) {
        $("#age-val").find("span").text(calculateAge(dob));
    } else {
        //do something for invalid date
    }
});

let selected = [];
$("#skill").change(function () {
    if (selected.indexOf($(this).val().trim()) < 0 && $(this).val().trim().toLowerCase() !== "select skill") {
        let tag = $(`<span class='tag small-description'>${$(this).val().trim()}&nbsp;<i class="ion-ios-close-empty"></i> </span>`);
        $("#skill-tags").append(tag);
        selected.push($(this).val().trim());
        tag.find("i").click(function () {
            selected.splice(selected.indexOf($(this).val().trim()), 1);
            tag.remove();
        })
    }
});
