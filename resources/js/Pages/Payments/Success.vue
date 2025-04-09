<template>
  <AuthenticatedLayout>
    <template #header>
      <h2 class="font-semibold text-xl text-gray-800 leading-tight">
        Payment Successful
      </h2>
    </template>

    <div class="py-12">
      <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
          <div class="p-6 text-gray-900">
            <div class="text-center mb-8">
              <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 class="mt-2 text-lg font-medium text-gray-900">Payment Successful!</h3>
              <p class="mt-1 text-sm text-gray-500">
                Your payment has been processed successfully.
              </p>
            </div>

            <div class="border-t border-gray-200 pt-8">
              <h3 class="text-lg font-medium mb-4">Payment Details</h3>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-sm text-gray-500">Asset</p>
                  <p class="font-medium">{{ payment.asset.name }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Amount</p>
                  <p class="font-medium">${{ payment.amount.toFixed(2) }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Payment Method</p>
                  <p class="font-medium capitalize">{{ payment.payment_method }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Transaction ID</p>
                  <p class="font-medium">{{ paymentDetails.transaction_id || 'N/A' }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Date</p>
                  <p class="font-medium">{{ new Date().toLocaleDateString() }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Status</p>
                  <p class="font-medium capitalize">{{ payment.status }}</p>
                </div>
              </div>
            </div>

            <div class="mt-8 border-t border-gray-200 pt-8">
              <h3 class="text-lg font-medium mb-4">Next Steps</h3>
              <div class="bg-blue-50 border-l-4 border-blue-400 p-4">
                <div class="flex">
                  <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <div class="ml-3">
                    <p class="text-sm text-blue-700">
                      The seller will contact you shortly to arrange for the transfer of the asset.
                      You can view your purchased assets in your dashboard.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-8 flex justify-center">
              <Link 
                :href="route('buyer.dashboard')"
                class="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 active:bg-blue-900 focus:outline-none focus:border-blue-900 focus:ring ring-blue-300 disabled:opacity-25 transition ease-in-out duration-150"
              >
                Return to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AuthenticatedLayout>
</template>

<script setup>
import { Link } from '@inertiajs/vue3';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { computed } from 'vue';

const props = defineProps({
  payment: Object,
  asset: Object,
});

const paymentDetails = computed(() => {
  return JSON.parse(props.payment.payment_details || '{}');
});
</script> 