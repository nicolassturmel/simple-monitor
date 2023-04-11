document.addEventListener('DOMContentLoaded', () => {
    const sessionId = window.location.pathname.split('/')[1];
    const appElement = document.getElementById('app');
    const servicesContainer = document.getElementById('services-container');
    const addServiceButton = document.getElementById('add-service');
  
    let sessionData = null;
    let useBackend = false;
  
    fetch(`/${sessionId}/data`)
      .then((response) => response.json())
      .then((data) => {
        sessionData = data;
        document.getElementById("useBackend").checked = sessionData.settings.useBackend;
        renderServices();
      });
  
    function renderServices() {
      servicesContainer.innerHTML = '';
      sessionData.services.forEach((service, index) => {
        const serviceCard = document.createElement('div');
        serviceCard.className = 'service-card';
        serviceCard.dataset.status = service.status;
        serviceCard.innerHTML = `
          <button class="remove-service" data-index="${index}">X</button>
          <p>${service.type.toUpperCase()} Service</p>
          <p>URL: ${service.url}</p>
        `;
  
        if (service.type === 'rest') {
          serviceCard.innerHTML += `
            <p>Méthode: ${service.method}</p>
            <p>Chemin: ${service.path}</p>
            <p>Valeur: ${service.value}</p>
            `;
          }
    
          servicesContainer.appendChild(serviceCard);
        });
    
        const removeServiceButtons = document.querySelectorAll('.remove-service');
        removeServiceButtons.forEach((button) => {
          button.addEventListener('click', (event) => {
            const serviceIndex = parseInt(event.target.dataset.index, 10);
            sessionData.services.splice(serviceIndex, 1);
            updateSessionData();
            renderServices();
          });
        });
      }
    
      function checkServiceStatus(service) {
        if (service.type === 'http') {
          return checkHTTPStatus(service.url);
        } else if (service.type === 'rest') {
          return checkRESTStatus(service.url, service.method, service.path, service.value);
        }
      }
    
      function checkHTTPStatus(url) {
        return fetch(url + '/turlututu.css', { mode: 'no-cors', method: 'HEAD' })
          .then(() => 'ok')
          .catch(() => 'error');
      }
    
      function checkRESTStatus(url, method, path, value) {
        return fetch(url, { mode: 'cors', method })
          .then((response) => response.json())
          .then((data) => {
            const actualValue = data[path];
            return actualValue === value ? 'ok' : 'error';
          })
          .catch(() => 'error');
      }
    
      function updateSessionData() {
        console.log(sessionData)
        fetch(`/${sessionId}/update`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(sessionData),
        });
      }
    
      addServiceButton.addEventListener('click', () => {
        const serviceType = prompt('Entrez le type de service (http ou rest):');
        if (serviceType !== 'http' && serviceType !== 'rest') {
          alert('Type de service invalide.');
          return;
        }
    
        const url = prompt('Entrez l\'URL du service:');
        const newService = {
          type: serviceType,
          url,
          status: 'pending',
        };
    
        if (serviceType === 'rest') {
          const method = prompt('Entrez la méthode (get ou post):');
          const path = prompt('Entrez le chemin:');
          const value = prompt('Entrez la valeur à vérifier:');
          newService.method = method;
          newService.path = path;
          newService.value = value;
        }
    
        sessionData.services.push(newService);
        updateSessionData();
        renderServices();
      });


    function onSettingsButtonClick() {
        const settingsDiv = document.getElementById("settings");
        settingsDiv.classList.toggle("hidden");
      }
      
    document.getElementById("settingsButton").addEventListener("click", onSettingsButtonClick);

    async function onSettingsChange() {
        const useBackend = document.getElementById("useBackend").checked;
        sessionData.settings.useBackend = useBackend;
      
        await updateSessionData();
      }

      

    document.getElementById("useBackend").addEventListener("change", onSettingsChange);

    
      setInterval(() => {
        sessionData.services.forEach((service, index) => {
          checkServiceStatus(service).then((status) => {
            service.status = status;
            renderServices();
          });
        });
      }, 5000);
    });
    