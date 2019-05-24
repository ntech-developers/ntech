/*
* Copyright 2019 Ntech developers
* This code contains all validations carried out for data to and fro the backend
* All form validations are found here
*/

//dependencies : jquery, jquery-dajax, util.js

const CheckList = {
    email: false,
    first_name: false,
    last_name: false,
    mobile: false,
    username: false,
    password1: false,
    password2: false,
    gender: true,
    country: true,
    institution: false,
    new_institution: false,
    date_of_birth: false,
};

function calculate_strength() {
    const strength = password_strength($(this).val()).toString();
    document.getElementById("strength-bar").style.width = strength + "%";
    $("#strength-val").text(strength + " %")
}

const password_input = $("#password");
password_input.keyup(calculate_strength);
password_input.change(calculate_strength);

$("#institution").change(function () {
    if ($(this).val() === "") {
        $("#ot-err").text("");
        $("#new_institution").prop("disabled", false);
    } else {
        $("#new_institution").prop("disabled", true);
    }
});

function calculateAge(birthday) {
    // birthday is a date
    let ageDifMs = Date.now() - birthday.getTime();
    let ageDate = new Date(ageDifMs);
    // milliseconds from epoch
    return Math.abs(ageDate.getUTCFullYear() - 1970);
}

$("#date_of_birth").change(function () {
    let dob = new Date($(this).val());
    if (dob) {
        $("#age-val").find("span").text(calculateAge(dob));
    } else {
        //do something for invalid date
    }
});

let selected = [];
$("#skill-select").change(function () {
    console.log("skill");
    if (selected.indexOf($(this).val().trim()) < 0 && $(this).val().trim().toLowerCase() !== "select skill") {
        let value = $(this).val().trim();
        let input = $("#skill");
        let tag = $(`<span class='tag small-description'>${value}&nbsp;<i class="ion-ios-close-empty"></i> </span>`);
        $("#skill-tags").append(tag);
        selected.push(value);
        input.val(selected.join(","));
        tag.find("i").click(function () {
            selected.splice(selected.indexOf(value), 1);
            tag.remove();
            input.val(selected.join(","));
        })
    }
});

function is_email_taken(email, on_complete = () => {
}) {
    if (email === "") {
        $("#em-err").text("This field cannot be empty");
        CheckList.email = false;
        return
    }
    $("#em-err").text("");
    $.ajax({
        type: "GET",
        url: "email/verify",
        data: {"email": email},
        success: function (response) {
            if (response["exists"]) {
                CheckList.email = false;
                $("#em-err").text("This email is taken");
            } else {
                CheckList.email = true;
                $("#em-err").text("");
            }
            $("#email").parent().removeClass("load-mode");
            on_complete();
        },
        error: function () {
            CheckList.email = false;
            $("#email").parent().removeClass("load-mode");
            on_complete();
        }
    })
}

function is_username_taken(username, on_complete = () => {
}) {
    if (username === "") {
        $("#un-err").text("This field cannot be empty");
        CheckList.username = false;
        return;
    }
    $("#un-err").text("");
    $("#username").parent().addClass("load-mode");
    $.ajax({
        type: "GET",
        url: "username/verify",
        data: {"username": username},
        success: function (response) {
            if (response["exists"]) {
                CheckList.username = false;
                $("#un-err").text("This username is taken");
            } else {
                CheckList.username = true;
                $("#un-err").text("");
            }
            $("#username").parent().removeClass("load-mode");
            on_complete();
        },
        error: function () {
            CheckList.username = false;
            $("#username").parent().removeClass("load-mode");
            on_complete();
        }
    })
}

function matches(input_1, input_2) {
    return $(input_1).val().toString().startsWith($(input_2).val())
}


function compare_password(ev = null, strict = false) {
    /*
    * The strict parameter is set to true when the user is typing through
    * the keyup event hence hides the error message as long as the user's
    * input is so far correct at the point of keying.
    */
    if (!$("#password2").val()) {
        $("#pw2-err").text("This field cannot be empty");
        CheckList.password2 = false;
    } else if (matches($("#password"), $("#password2")) && !strict) {
        $("#pw2-err").text("");
    } else if (strict && ($("#password").val() === $("#password2").val())) {
        $("#pw2-err").text("");
        CheckList.password2 = true;
    } else {
        $("#pw2-err").text("The password entered does not match");
        CheckList.password2 = false;
    }
}

function field_is_required(field, error, condition = null) {
    $(field).on("blur keyup change", function () {
        if (condition !== null && !condition()) {
            $(error).text("");
            CheckList[$(this).attr("name")] = true;
            return
        }
        if ($(this).val().toString() === "") {
            CheckList[$(this).attr("name")] = false;
            $(error).text("This field cannot be empty");
        } else {
            $(error).text("");
            CheckList[$(this).attr("name")] = true;
        }
    })
}

function submit(event) {
    event.preventDefault(1);
    $("input").trigger("blur"); // Force validations to be carried out by the inputs
    let failed = false;
    let fail_location = [];
    for (let key in CheckList) {
        if (CheckList.hasOwnProperty(key)) {
            if (!CheckList[key]) {
                failed = true;
                fail_location.push(document.getElementsByName(key)[0]);
            }
        }
    }
    if (failed && fail_location[0]) {
        fail_location[0].scrollIntoView({behavior: "smooth", block: "center"});
    } else {
        $("#submit").trigger("click");
    }
}

function institution_validation() {
    let institution = $("#institution");
    let other = $("#new_institution");
    if (institution.val() === "") {
        CheckList.institution = true;
        if (!other.val()) {
            $("#ot-err").text("This field cannot be empty");
            CheckList.new_institution = false;
        } else {
            $("#ot-err").text("");
            CheckList.new_institution = true;
        }
    } else {
        $("#ot-err").text("");
        CheckList.new_institution = true;
        CheckList.institution = true;
    }
}

$("#pre-submit").click(submit);
$("#username").blur(function () {
    is_username_taken($(this).val())
});
$("#email").blur(function () {
    is_email_taken($(this).val())
});
$("#password2").blur(() => compare_password(null, true));
$("#password2").keyup(compare_password);
$("#new_institution").on("blur keyup", institution_validation);
field_is_required($("#first_name"), $("#fn-err"));
field_is_required($("#username"), $("#un-err"));
field_is_required($("#mobile"), $("#mb-err"));
field_is_required($("#password"), $("#pw-err"));
field_is_required($("#date_of_birth"), $("#dob-err"));
field_is_required($("#last_name"), $("#ln-err"));
field_is_required($("#gender"), $("#gn-err"));
field_is_required($("#country"), $("#ct-err"));
field_is_required($("#email"), $("#em-err"));

// =================================== login validators ==================================

const csrf = document.getElementsByName("csrfmiddlewaretoken")[0].value;

function pre_authenticate() {
    if (!$("#id_password").val() || !$("#id_username").val()) return;
    $("#id_password").parent().addClass("load-mode"); // start loader
    $(".error").text(""); // Clear existing errors
    $.ajax({
        type: "POST",
        url: "preauth",
        data: {"username": $("#id_username").val(), "password": $("#id_password").val(), "csrfmiddlewaretoken": csrf},
        success: function (response) {
            switch (response.status) {
                case 0:
                    $("#sign_in").trigger("click");
                    break;
                case 1:
                    $("#lpw-err").text("The password entered is incorrect");
                    break;
                case 2:
                    $("#lun-err").text("This username does not exists");
            }
            $("#id_password").parent().removeClass("load-mode"); // quit loader
        },
        error: function () {
            $("#lpw-err").text("Failed to authenticate. Check your connection.");
            $("#id_password").parent().removeClass("load-mode");
        }
    })
}

field_is_required($("#id_username"), $("#lun-err"));
field_is_required($("#id_password"), $("#lpw-err"));
$("#pre-submit").click(pre_authenticate);