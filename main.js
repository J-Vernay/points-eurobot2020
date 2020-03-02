
function hideIfEmpty(elem) {
    if (elem.innerHTML === "")
        elem.setAttribute("hidden","");
    else
        elem.removeAttribute("hidden");
}
function getValidator(type) {
    switch (type) {
        case "port":
            return function(form) {
                const nbPort = parseInt(form.querySelector('[name="nbPort"]').value);
                const nbChenaux = parseInt(form.querySelector('[name="nbChenaux"]').value);
                const nbPaires = parseInt(form.querySelector('[name="nbPaires"]').value);
                const errMes = form.querySelector('ul.alert');
                errMes.innerHTML = "";
                if (nbChenaux > nbPort)
                    errMes.innerHTML += "<li>+ de gobelets sur les chenaux que dans le port</li>";
                if (2*nbPaires > nbChenaux)
                    errMes.innerHTML += "<li>+ de paires comptées que de paires possibles avec les gobelets des chenaux</li>";

                hideIfEmpty(errMes);
                form.dataset.score = (errMes.innerHTML != "" ? NaN : nbPort + nbChenaux + 2*nbPaires);
            };
        case "mancheaair":
            return function(form) {
                const nbManchesaAir = parseInt(form.querySelector('[name="nbManchesaAir"]').value);
                const errMes = form.querySelector('ul.alert');
                errMes.innerHTML = "";
                if (nbManchesaAir < 0)
                    errMes.innerHTML += "<li>Nombre de manches à air &lt; 0</li>";
                else if (nbManchesaAir > 2)
                    errMes.innerHTML += "<li>Nombre de manches à air &gt; 2</li>";

                hideIfEmpty(errMes);
                form.dataset.score = (errMes.innerHTML != "" ? NaN : [0,5,15][nbManchesaAir]);
            };
        case "phare":
            return function(form) {
                const phareDepose = form.querySelector('[name="phareDepose"]').checked;
                const phareActif = form.querySelector('[name="phareActif"]').checked;
                const phareCorrect = form.querySelector('[name="phareCorrect"]').checked;
                const errMes = form.querySelector('ul.alert');
                errMes.innerHTML = "";
                if (phareActif && !phareDepose)
                    errMes.innerHTML += "<li>Phare activé mais pas déposé</li>";
                if (phareCorrect && !phareActif)
                    errMes.innerHTML += "<li>Phare déployé mais pas activé</li>";

                hideIfEmpty(errMes);
                form.dataset.score = (errMes.innerHTML != "" ? NaN : 2*phareDepose + 3*phareActif + 10*phareCorrect);
            }
    }
    return function(elem) { alert("error 1234"); };
}

function updateScore() {
    let scoreJaune = 0;
    let scoreBleue = 0;
    for (const form of document.querySelectorAll('form[name*="jaune"]'))
        scoreJaune += parseInt(form.dataset.score);
    for (const form of document.querySelectorAll('form[name*="bleue"]'))
        scoreBleue += parseInt(form.dataset.score);
    document.getElementById("score-jaune").innerHTML = ""+scoreJaune;
    document.getElementById("score-bleue").innerHTML = ""+scoreBleue;
}

window.addEventListener('DOMContentLoaded', ()=> {
    // background-color
    const colorAsked = window.location.hash;
    document.body.style.backgroundColor = colorAsked || "#FFFFFFFF";

    // add validators to vanilla <input>
    for (const form of document.querySelectorAll("form[data-validator]")) {
        const errorMessage = document.createElement("ul");
        errorMessage.className = "alert alert-danger";
        errorMessage.setAttribute("hidden", "");
        form.appendChild(errorMessage);
        form.validatorFunc = () => { getValidator(form.dataset.validator)(form); updateScore(); };
        for (const input of document.querySelectorAll("input"))
            input.addEventListener("input", form.validatorFunc);
    }

    // on ajoute le score
    for (const form of document.getElementsByTagName("form"))
        form.dataset.score = 0;

    // create the "nbr-input" custom input
    for (const elem of document.getElementsByClassName("nbr-input")) {
        elem.classList.add("row");
        elem.classList.add("form-inline");

        const input = document.createElement("input");
        input.type = "text";
        input.classList.add("form-control");
        input.classList.add("width-input");
        input.value = "0";
        input.setAttribute("name", elem.dataset.name);
        input.id = elem.dataset.id;
        input.dataset.valid = "";
        elem.appendChild(input);
        if (input.form.validatorFunc)
            input.addEventListener('input',input.form.validatorFunc);

        const newButton = function(name, intTransform) {
            const btn = document.createElement("button");
            btn.className = "btn btn-primary";
            btn.textContent = name;
            btn.style.marginLeft = "20px";
            btn.addEventListener('click', (evnt) => {
                let val = intTransform(parseInt(input.value));
                if (val < 0) val = 0;
                if (val > elem.dataset.max) val = elem.dataset.max;
                input.value = ""+val;
                if (input.form.validatorFunc)
                    input.form.validatorFunc();
                evnt.preventDefault();
            });
            return btn;
        };

        elem.appendChild(newButton("+1", nb => nb + 1));
        elem.appendChild(newButton("-1", nb => (nb <= 1 ? 0 : nb - 1)));
        elem.appendChild(newButton("C", nb => 0));
    }
});