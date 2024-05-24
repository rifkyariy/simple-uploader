<template>
  <div
    class="flex flex-col items-center justify-center min-h-screen bg-gray-900"
  >
    <h1 class="font-sans pb-4 text-xl font-bold text-white">Project Setup</h1>
    <div class="bg-gray-800 p-6 rounded-lg w-lg-[500px] max-w-md text-white">
      <form @submit.prevent="saveEndpointUrl">
        <div>
          <label class="text-gray-400 mb-4" for="endpointUrl">
            Tunnel URL
          </label>
          <input
            id="endpointUrl"
            v-model="newEndpointUrl"
            class="w-full my-4 p-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="text"
            placeholder="Enter new Tunnel URL"
          />
        </div>
        <button
          type="submit"
          class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg focus:outline-none"
        >
          Save URL
        </button>
      </form>
      <div class="mt-6">
        <p class="text-gray-400">Current URL:</p>
        <p class="font-mono">
          {{ endpointUrl.url === "" ? "-" : endpointUrl.url }}
        </p>
        <div class="flex items-center space-x-2">
          <div
            :class="{
              'bg-green-500': serverStatus === 'online',
              'bg-red-500': serverStatus === 'offline',
            }"
            class="w-3 h-3 rounded-full"
          ></div>
          <span class="text-white font-semibold pb-1"
            >Server Status: {{ serverStatus }}</span
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import Swal from "sweetalert2";
import axios from "axios";

const ENDPOINT_URL = import.meta.env.VITE_ENDPOINT_URL;
const localStorageKey = process.env.localStorageKey || "projectEndpointUrl";
const serverStatus = ref("offline");
const endpointUrl = ref("");
const newEndpointUrl = ref("");
const lastWorkingUrl = process.client
  ? localStorage.getItem(localStorageKey) || ""
  : "";

const testEndpoint = async (url) => {
  try {
    const response = await axios.get(`${url}/api/status`);
    if (response.status === 200) {
      return true;
    } else {
      throw new Error("Endpoint test failed");
    }
  } catch (error) {
    throw new Error("Endpoint test failed");
  }
};

const getEndpointList = async () => {
  try {
    const response = await axios.get(`${ENDPOINT_URL}/projects`);
    endpointUrl.value = response.data[0];

    // Test the endpoint URL
    await testEndpoint(endpointUrl.value.url);
    serverStatus.value = "online";
  } catch (error) {
    console.error(error);
    serverStatus.value = "offline";

    // Use the last working URL from local storage if available
    if (lastWorkingUrl) {
      endpointUrl.value.url = lastWorkingUrl;
      await testEndpoint(lastWorkingUrl); // Test the last working URL
      serverStatus.value = "online";
    }
  }
};

const saveEndpointUrl = async () => {
  const previousUrl = endpointUrl.value.url; // Store the current URL
  try {
    const response = await axios.put(
      `${ENDPOINT_URL}/projects/${endpointUrl.value.id}`,
      { url: newEndpointUrl.value }
    );

    if (response.status === 200) {
      Swal.fire("Success", "Tunnel URL saved successfully", "success");
      endpointUrl.value.url = newEndpointUrl.value;
      process.client &&
        localStorage.setItem(localStorageKey, newEndpointUrl.value); // Update last working URL
      await testEndpoint(newEndpointUrl.value); // Test the updated endpoint URL
      serverStatus.value = "online";
    } else {
      throw new Error("Failed to save URL");
    }
  } catch (error) {
    console.error(error);
    Swal.fire("Error", "Failed to save Tunnel URL", "error");
    serverStatus.value = "offline";

    // Revert to the previous URL
    endpointUrl.value.url = previousUrl;
    process.client && localStorage.setItem(localStorageKey, previousUrl); // Update last working URL
    await testEndpoint(previousUrl); // Test the previous URL
    serverStatus.value = "online";
  }
};

getEndpointList();
</script>

<style scoped>
/* Add any additional styles here */
</style>
