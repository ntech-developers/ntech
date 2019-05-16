/*
* Copyright 2019 Ntech developers
* This code contains all validations carried out for data to and fro the backend
* All form validations are found here
*/

//dependencies : jquery, jquery-dajax, util.js

const CheckList = {};

function validate_email_1() {

}

function validate_mobile() {
    let country_code = $("#country_code").val();
    let mobile = $("#mobile").val();
    if (country_code && mobile) {
        return country_code.toString() + mobile.toString();
    }
    return false
}

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
        let value = $(this).val().trim();
        let tag = $(`<span class='tag small-description'>${value}&nbsp;<i class="ion-ios-close-empty"></i> </span>`);
        $("#skill-tags").append(tag);
        selected.push(value);
        tag.find("i").click(function () {
            selected.splice(selected.indexOf(value), 1);
            tag.remove();
        })
    }
});

function is_email_taken(email, on_complete = () => {
}) {
    $.ajax({
        type: "GET",
        url: "accounts/email/verify",
        data: {"email": email},
        success: function (response) {
            if (response["exists"]) {
                CheckList.email = false;
                $("#em-err").text("This email is taken");
            } else {
                CheckList.email = email;
            }
            on_complete();
        },
        error: function () {
            CheckList.email = false;
            on_complete()
        }
    })
}

function is_username_taken(email, on_complete = () => {
}) {
    $.ajax({
        type: "GET",
        url: "accounts/username/verify",
        data: {"email": email},
        success: function (response) {
            if (response["exists"]) {
                CheckList.email = false;
                $("#em-err").text("This email is taken");
            } else {
                CheckList.email = email;
                $("#em-err").text("");
            }
            on_complete();
        },
        error: function () {
            CheckList.email = false;
            on_complete();
        }
    })
}

function matches(input_1, input_2) {
    return $(input_1).val().toString().startsWith($(input_2).val())
}

function compare_email(ev = null, strict = false) {
    if (matches($("#email"), $("#email2")) && !strict)
        $("#em2-err").text("");
    else if (strict && ($("#email").val() === $("#email2").val()))
        $("#em2-err").text("");
    else if (!$("#email2").val())
        $("#em2-err").text("This field cannot be empty");
    else
        $("#em2-err").text("The email entered does not match")
}

function field_is_required(ev = null, checklist_name, error) {
    if ($(this).val().toString() === "") {
        CheckList[checklist_name] = false;
        $(error).text("this field cannot be empty");
    } else {
        $(error).text("");
    }
}

$("#email").blur(function () {
    is_username_taken($(this).val())
});
$("#email2").blur(() => compare_email(null, true));
$("#email2").keyup(compare_email);
$("#name").blur(function () {
    field_is_required(null, "name", $("#nm-err"))
});