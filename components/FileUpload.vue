<template>
  <div
    class="flex flex-col items-center justify-center min-h-screen bg-gray-900"
  >
    <div class="absolute top-0 w-full bg-gray-800 p-4">
      <div class="flex items-center justify-center space-x-2">
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
    <h1 class="font-sans pb-2 text-xl font-bold text-white">Ssst... 🤫</h1>
    <input
      type="file"
      ref="fileInput"
      @change="handleFileChange"
      class="hidden"
      accept="image/*,video/*"
    />
    <div
      v-if="!previewUrl"
      class="border-2 border-dashed border-gray-600 p-6 rounded-lg bg-gray-800 text-center cursor-pointer"
      @click="triggerFileInput"
      @dragover.prevent
      @drop.prevent="handleDrop"
    >
      <p class="text-gray-400">Drag & Drop an image or video here</p>
      <p v-if="progress > 0" class="text-gray-400 mt-2">
        Uploading: {{ progress }}%
      </p>
    </div>

    <div v-if="previewUrl" class="mt-4 text-center w-full max-w-lg">
      <div class="relative">
        <img
          v-if="isImage"
          :src="previewUrl"
          class="max-w-full h-auto rounded-lg shadow-lg border"
        />
        <video
          v-else
          :src="previewUrl"
          controls
          class="max-w-full h-auto rounded-lg shadow-lg"
        ></video>
        <button
          @click="deleteFile"
          class="absolute top-4 right-4 bg-red-400 text-white rounded-full p-2 focus:outline-none"
        >
          &#x2716;
        </button>
      </div>
      <div class="mt-4 flex justify-end">
        <button
          @click="confirmUpload"
          class="bg-blue-600 text-white py-2 px-4 rounded-lg focus:outline-none"
        >
          Confirm Upload
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import Swal from "sweetalert2";
import axios from "axios";

// endpoint from env
const ENDPOINT_URL = import.meta.env.VITE_ENDPOINT_URL;
let quietCloudUrl = "";

const fileInput = ref(null);
const progress = ref(0);
const previewUrl = ref(null);
const isImage = ref(false);
const serverStatus = ref("offline");
let selectedFile = null;

const triggerFileInput = () => {
  fileInput.value.click();
};

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    previewFile(file);
    selectedFile = file;
  }
};

const handleDrop = (event) => {
  const file = event.dataTransfer.files[0];
  if (file) {
    previewFile(file);
    selectedFile = file;
  }
};

const previewFile = (file) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    previewUrl.value = e.target.result;
    isImage.value = file.type.startsWith("image/");
  };
  reader.readAsDataURL(file);
};

const getEndpointList = async () => {
  try {
    const response = await axios.get(`${ENDPOINT_URL}/projects`);

    // set quietCloudUrl from first array of response data
    quietCloudUrl = response.data[0].url;

    // test the endpoint url
    await testEndpoint(quietCloudUrl);

    // set server status to online
    serverStatus.value = "online";

    // show success message
    Swal.fire("Success", "Endpoint list fetched successfully", "success");
  } catch (error) {
    console.error(error);
    serverStatus.value = "offline";
  }
};

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

const confirmUpload = async () => {
  if (!selectedFile) return;

  const formData = new FormData();
  formData.append("file", selectedFile);

  try {
    const response = await axios.post(`${quietCloudUrl}/api/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (event) => {
        if (event.lengthComputable) {
          progress.value = Math.round((event.loaded * 100) / event.total);
        }
      },
    });

    if (response.status === 201) {
      Swal.fire("Success", "File uploaded successfully", "success");
      resetFileInput();
    } else {
      throw new Error("Upload failed");
    }
  } catch (error) {
    Swal.fire("Error", error.message, "error");
  } finally {
    progress.value = 0;
  }
};

const deleteFile = () => {
  previewUrl.value = null;
  selectedFile = null;
  isImage.value = false;
  fileInput.value.value = ""; // Clear the file input
};

const resetFileInput = () => {
  previewUrl.value = null;
  selectedFile = null;
  isImage.value = false;
  fileInput.value.value = ""; // Clear the file input
};

// on mounted
onMounted(getEndpointList);
</script>

<style scoped>
.upload-container {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.drop-zone {
  width: 300px;
  height: 200px;
  border: 2px dashed #555;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  background-color: #1e1e1e;
  color: #ccc;
  transition: background-color 0.3s, color 0.3s;
}

.drop-zone:hover {
  background-color: #333;
  color: #fff;
}

.drop-zone p {
  margin: 0;
  text-align: center;
}

.preview-container {
  margin-top: 16px;
}

.preview-container img,
.preview-container video {
  max-width: 100%;
  max-height: 300px;
}

.button-group {
  margin-top: 16px;
  display: flex;
  justify-content: space-between;
}
</style>
