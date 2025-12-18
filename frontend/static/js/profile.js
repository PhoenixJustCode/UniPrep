// Profile.js - Hardened version with custom modal and extensive logging
console.log("DEBUG: profile.js script started executing");

window.showHidden = window.showHidden || false;

function showCustomConfirm(message) {
  console.log("DEBUG: showCustomConfirm requested with message:", message);
  return new Promise((resolve) => {
    const modal = document.getElementById("customModal");
    const modalMessage = document.getElementById("modalMessage");
    const confirmBtn = document.getElementById("modalConfirm");
    const cancelBtn = document.getElementById("modalCancel");

    if (!modal || !modalMessage || !confirmBtn || !cancelBtn) {
      console.error("DEBUG: Modal elements NOT FOUND in DOM!");
      // Fallback if modal elements are missing
      resolve(confirm(message));
      return;
    }

    modalMessage.textContent = message;
    modal.style.display = "flex";
    console.log("DEBUG: Custom modal displayed");

    const onConfirm = () => {
      console.log("DEBUG: Custom modal - user clicked CONFIRM");
      modal.style.display = "none";
      cleanup();
      resolve(true);
    };

    const onCancel = () => {
      console.log("DEBUG: Custom modal - user clicked CANCEL");
      modal.style.display = "none";
      cleanup();
      resolve(false);
    };

    const cleanup = () => {
      confirmBtn.removeEventListener("click", onConfirm);
      cancelBtn.removeEventListener("click", onCancel);
    };

    confirmBtn.addEventListener("click", onConfirm);
    cancelBtn.addEventListener("click", onCancel);
  });
}

window.loadProfile = async function () {
  console.log("DEBUG: loadProfile started");
  try {
    const response = await fetch("/api/profile");
    console.log("DEBUG: Profile fetch response status:", response.status);
    if (response.ok) {
      const user = await response.json();
      console.log("DEBUG: Profile data received for user:", user.email);
      document.getElementById("viewEmail").textContent = user.email || "---";
      document.getElementById("viewName").textContent = user.name || "---";
      document.getElementById("viewPhone").textContent = user.phone || "---";

      document.getElementById("email").value = user.email || "";
      document.getElementById("name").value = user.name || "";
      document.getElementById("phone").value = user.phone || "";
    } else {
      console.error("DEBUG: Failed to load profile. Status:", response.status);
    }
  } catch (error) {
    console.error("DEBUG: Exception in loadProfile:", error);
  }
  window.loadTestHistory();
};

window.enableEdit = function () {
  console.log("DEBUG: enableEdit called");
  document.getElementById("profileView").style.display = "none";
  document.getElementById("profileEdit").style.display = "block";
};

window.cancelEdit = function () {
  console.log("DEBUG: cancelEdit called");
  window.loadProfile();
  document.getElementById("profileView").style.display = "block";
  document.getElementById("profileEdit").style.display = "none";
  document.getElementById("message").style.display = "none";
};

window.loadTestHistory = async function () {
  console.log(
    "DEBUG: loadTestHistory started, showHidden =",
    window.showHidden
  );
  try {
    const response = await fetch("/api/tests/history");
    console.log("DEBUG: History fetch response status:", response.status);
    if (response.ok) {
      const history = await response.json();
      console.log(
        "DEBUG: History items received:",
        history ? history.length : 0
      );
      const historyList = document.getElementById("historyList");

      if (!history || history.length === 0) {
        historyList.innerHTML = "<p>История пуста</p>";
        return;
      }

      historyList.innerHTML = "";

      const hiddenItemsString =
        localStorage.getItem("hiddenHistoryItems") || "[]";
      const hiddenItems = JSON.parse(hiddenItemsString).map((id) =>
        parseInt(id)
      );
      console.log("DEBUG: hiddenHistoryItems from localStorage:", hiddenItems);

      let visibleCount = 0;
      history.forEach((item) => {
        const itemId = parseInt(item.id);
        const isHidden = hiddenItems.includes(itemId);

        if (isHidden && !window.showHidden) {
          return;
        }

        visibleCount++;

        const historyItem = document.createElement("div");
        historyItem.className = isHidden
          ? "history-item hidden-item"
          : "history-item";

        if (isHidden) {
          historyItem.style.opacity = "0.5";
          historyItem.style.border = "1px dashed #ccc";
        }

        const btnText = isHidden ? "👁️‍🗨️" : "👁️";
        const btnTitle = isHidden ? "Показать" : "Скрыть";
        const statusSuffix = isHidden ? " (Скрыто)" : "";

        historyItem.innerHTML =
          ' \
                    <div class="history-item-content"> \
                        <div class="history-item-info"> \
                            <h4>' +
          item.subject_name +
          " - " +
          item.test_type_name +
          statusSuffix +
          "</h4> \
                            <p>" +
          new Date(item.completed_at).toLocaleString("ru-RU") +
          '</p> \
                        </div> \
                        <div class="history-item-score"> \
                            ' +
          item.score +
          "/" +
          item.total_questions +
          " (" +
          item.percentage.toFixed(1) +
          '%) \
                        </div> \
                    </div> \
                    <div class="history-item-actions"> \
                        <button class="history-item-btn" onclick="window.toggleHistoryItem(' +
          itemId +
          ')" title="' +
          btnTitle +
          '">' +
          btnText +
          '</button> \
                        <button class="history-item-btn delete-btn" onclick="window.deleteHistoryItem(' +
          itemId +
          ')" title="Удалить">🗑️</button> \
                    </div> \
                ';
        historyList.appendChild(historyItem);
      });
      console.log("DEBUG: Rendered", visibleCount, "history items");
    } else {
      console.error("DEBUG: Failed to load history. Status:", response.status);
    }
  } catch (error) {
    console.error("DEBUG: Exception in loadTestHistory:", error);
  }
};

window.toggleShowHidden = function () {
  console.log("DEBUG: toggleShowHidden called. Old state:", window.showHidden);
  window.showHidden = !window.showHidden;
  const btn = document.getElementById("showHiddenBtn");
  if (btn) {
    btn.textContent = window.showHidden
      ? 'Скрыть "скрытые"'
      : "Показать скрытые";
  }
  window.loadTestHistory();
};

window.toggleHistoryItem = function (sessionId) {
  sessionId = parseInt(sessionId);
  console.log("DEBUG: toggleHistoryItem for sessionId:", sessionId);
  let items = JSON.parse(
    localStorage.getItem("hiddenHistoryItems") || "[]"
  ).map((id) => parseInt(id));
  const idx = items.indexOf(sessionId);
  if (idx !== -1) {
    console.log("DEBUG: Removing from hiddenItems list");
    items.splice(idx, 1);
  } else {
    console.log("DEBUG: Adding to hiddenItems list");
    items.push(sessionId);
  }
  localStorage.setItem("hiddenHistoryItems", JSON.stringify(items));
  window.loadTestHistory();
};

window.deleteHistoryItem = async function (sessionId) {
  sessionId = parseInt(sessionId);
  console.log("DEBUG: deleteHistoryItem STARTED for sessionId:", sessionId);

  const confirmed = await showCustomConfirm(
    "Удалить эту запись навсегда из базы данных?"
  );
  if (!confirmed) {
    console.log("DEBUG: deleteHistoryItem ABORTED by user");
    return;
  }
  console.log(
    "DEBUG: deleteHistoryItem CONFIRMED by user, sending DELETE request..."
  );

  try {
    const response = await fetch("/api/tests/history/" + sessionId, {
      method: "DELETE",
    });
    console.log("DEBUG: Server DELETE response status:", response.status);

    if (response.ok) {
      console.log("DEBUG: Deletion SUCCESS on server");
      // Also clean up localStorage if it was hidden
      let items = JSON.parse(
        localStorage.getItem("hiddenHistoryItems") || "[]"
      ).map((id) => parseInt(id));
      const oldLen = items.length;
      items = items.filter((id) => id !== sessionId);
      if (items.length < oldLen) {
        console.log(
          "DEBUG: Cleaned up sessionId from hiddenItems in localStorage"
        );
        localStorage.setItem("hiddenHistoryItems", JSON.stringify(items));
      }
      console.log("DEBUG: Reloading history UI...");
      window.loadTestHistory();
    } else {
      console.error(
        "DEBUG: Server reported error during deletion. Status:",
        response.status
      );
      const errData = await response.json().catch(() => ({}));
      alert("Ошибка при удалении: " + (errData.error || response.statusText));
    }
  } catch (error) {
    console.error("DEBUG: EXCEPTION during deletion request:", error);
    alert("Критическая ошибка при удалении: " + error.message);
  }
};

window.logout = async function () {
  console.log("DEBUG: Logout requested");
  try {
    await fetch("/api/logout", { method: "POST" });
    location.href = "/";
  } catch (e) {
    console.error("DEBUG: Logout error", e);
    location.href = "/"; // Force redirect anyway
  }
};

// Initial load
console.log("DEBUG: Initiating initial page load...");
window.loadProfile();
console.log("DEBUG: profile.js finished initialization");
