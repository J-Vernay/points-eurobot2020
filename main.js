

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
            
            
            if (errMes.innerHTML === "")
                errMes.setAttribute("hidden","");
            else
                errMes.removeAttribute("hidden");
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
            
            if (errMes.innerHTML === "")
                errMes.setAttribute("hidden","");
            else
                errMes.removeAttribute("hidden");
        }
    }
    return function(elem) { alert("error 1234"); };
}

window.addEventListener('DOMContentLoaded', ()=> {
    for (const form of document.querySelectorAll("form[data-validator]")) {
        const errorMessage = document.createElement("ul");
        errorMessage.className = "alert alert-danger";
        errorMessage.setAttribute("hidden", "");
        form.appendChild(errorMessage);
        form.validatorFunc = () => getValidator(form.dataset.validator)(form);
        if (form.validatorFunc)
            for (const input of document.querySelectorAll("input"))
                input.addEventListener("input", form.validatorFunc);
    }
    
    for (const elem of document.getElementsByClassName("nbr-input")) {
        elem.classList.add("row");
        elem.classList.add("form-inline");
        
        
        const input = document.createElement("input");
        input.type = "text";
        input.classList.add("form-control");
        input.value = "0";
        input.setAttribute("readonly", "");
        input.setAttribute("name", elem.dataset.name);
        input.id = elem.dataset.id;
        input.dataset.valid = "";
        elem.appendChild(input);
        
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
        }
        
        elem.appendChild(newButton("+1", nb => nb + 1));
        elem.appendChild(newButton("-1", nb => (nb <= 1 ? 0 : nb - 1)));
        elem.appendChild(newButton("C", nb => 0));
    }
    
    
});