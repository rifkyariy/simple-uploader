<template>
  <div class="px-8 py-8 bg-slate-900 min-h-screen">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold mb-6 text-white">Shared Media</h1>
      <div class="flex items-center space-x-2">
        <div
          :class="{
            'bg-green-500': serverStatus === 'online',
            'bg-red-500': serverStatus === 'offline',
          }"
          class="w-3 h-3 rounded-full"
        ></div>
        <span class="text-white font-semibold pb-1">{{ serverStatus }}</span>
      </div>
    </div>

    <div
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-12 xl:grid-cols-12 gap-2"
    >
      <div v-for="(media, index) in mediaList" :key="index" class="relative">
        <button @click="openModal(index)">
          <img
            v-if="media.type === 'image'"
            :src="media.url"
            alt="Image"
            class="w-full h-auto rounded-lg shadow-lg cursor-pointer"
          />
          <video
            v-else-if="media.type === 'video'"
            :src="media.url"
            class="w-full h-auto rounded-lg shadow-lg cursor-pointer"
          ></video>
          <span
            v-if="media.isNew"
            class="absolute top-2 left-2 bg-red-600 text-white text-xs font-semibold py-1 px-2 rounded"
          >
            New
          </span>
        </button>
      </div>
    </div>

    <!-- Modal -->
    <div
      v-if="modalMedia !== null"
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75"
    >
      <div class="relative bg-gray-900 rounded-lg p-4 max-w-3xl w-full">
        <button
          class="absolute top-2 right-2 text-gray-400"
          @click="closeModal"
        >
          <svg
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>

        <button
          class="absolute top-1/2 left-2 transform -translate-y-1/2 text-gray-400 bg-gray-800 rounded-full p-2"
          @click="prevMedia"
        >
          <svg
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            ></path>
          </svg>
        </button>

        <button
          class="absolute top-1/2 right-2 transform -translate-y-1/2 text-gray-400 bg-gray-800 rounded-full p-2"
          @click="nextMedia"
        >
          <svg
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            ></path>
          </svg>
        </button>

        <div>
          <img
            v-if="modalMedia.type === 'image'"
            :src="modalMedia.url"
            alt="Image"
            class="w-full rounded-lg shadow-lg"
          />
          <video
            v-else-if="modalMedia.type === 'video'"
            :src="modalMedia.url"
            controls
            class="w-full rounded-lg shadow-lg"
          ></video>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";

const mediaList = ref([]);

const ENDPOINT_URL = import.meta.env.VITE_ENDPOINT_URL;
const quietCloud = ref("");
const serverStatus = ref("offline");

const modalMedia = ref(null);
const modalIndex = ref(null);

const openModal = (index) => {
  modalIndex.value = index;
  modalMedia.value = mediaList.value[index];
};

const closeModal = () => {
  modalMedia.value = null;
  modalIndex.value = null;
};

const prevMedia = () => {
  if (modalIndex.value > 0) {
    modalIndex.value--;
  } else {
    modalIndex.value = mediaList.value.length - 1;
  }
  modalMedia.value = mediaList.value[modalIndex.value];
};

const nextMedia = () => {
  if (modalIndex.value < mediaList.value.length - 1) {
    modalIndex.value++;
  } else {
    modalIndex.value = 0;
  }
  modalMedia.value = mediaList.value[modalIndex.value];
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

const getEndpointList = async () => {
  try {
    const response = await axios.get(`${ENDPOINT_URL}/projects`);
    quietCloud.value = response.data[0];

    // Test the endpoint URL
    await testEndpoint(quietCloud.value.url);
    serverStatus.value = "online";
  } catch (error) {
    console.error(error);
    serverStatus.value = "offline";
  }
};

const getMediaList = async () => {
  try {
    const response = await axios.get(`${quietCloud.value.url}/api/media`);
    mediaList.value = response.data;
  } catch (error) {
    console.error(error);
  }
};

// ON MOUNTED
onMounted(async () => {
  await getEndpointList();
  await getMediaList();
});
</script>

<style scoped>
/* Container styling */
.p-4 {
  padding: 16px;
}

/* Modal styling */
.modal-media {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-content {
  background-color: #1e1e1e;
  border-radius: 10px;
  padding: 20px;
  max-width: 80%;
  max-height: 80%;
  overflow: auto;
}

.modal-close {
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
}
</style>
