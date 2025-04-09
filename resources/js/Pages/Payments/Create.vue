<template>
  <AuthenticatedLayout>
    <template #header>
      <h2 class="font-semibold text-xl text-gray-800 leading-tight">
        Complete Payment
      </h2>
    </template>

    <div class="py-12">
      <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
          <div class="p-6 text-gray-900">
            <div v-if="payment" class="mb-8">
              <h3 class="text-lg font-medium mb-4">Payment Details</h3>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-sm text-gray-500">Asset</p>
                  <p class="font-medium">{{ asset.name }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Amount</p>
                  <p class="font-medium">${{ payment.amount.toFixed(2) }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Status</p>
                  <p class="font-medium capitalize">{{ payment.status }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Due Date</p>
                  <p class="font-medium">{{ new Date().toLocaleDateString() }}</p>
                </div>
              </div>
            </div>

            <div class="mt-8">
              <h3 class="text-lg font-medium mb-4">Select Payment Method</h3>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Stripe Payment -->
                <div class="border rounded-lg p-6">
                  <h4 class="font-medium mb-4">Pay with Card</h4>
                  <form @submit.prevent="processStripePayment">
                    <div id="card-element" class="mb-4"></div>
                    <button 
                      type="submit" 
                      class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      :disabled="processing"
                    >
                      {{ processing ? 'Processing...' : 'Pay with Card' }}
                    </button>
                  </form>
                </div>

                <!-- M-Pesa Payment -->
                <div class="border rounded-lg p-6">
                  <h4 class="font-medium mb-4">Pay with M-Pesa</h4>
                  <form @submit.prevent="processMpesaPayment">
                    <div class="mb-4">
                      <label for="phone" class="block text-sm font-medium text-gray-700">Phone Number</label>
                      <input 
                        type="tel" 
                        id="phone" 
                        v-model="phone" 
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="2547XXXXXXXX"
                        required
                      />
                    </div>
                    <button 
                      type="submit" 
                      class="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                      :disabled="processing"
                    >
                      {{ processing ? 'Processing...' : 'Pay with M-Pesa' }}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AuthenticatedLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useForm } from '@inertiajs/vue3';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { loadStripe } from '@stripe/stripe-js';

const props = defineProps({
  asset: Object,
  payment: Object,
  stripeKey: String,
  clientSecret: String,
});

const processing = ref(false);
const phone = ref('');
const stripe = ref(null);
const cardElement = ref(null);

const stripeForm = useForm({
  payment_method: '',
});

const mpesaForm = useForm({
  phone: '',
});

onMounted(async () => {
  // Initialize Stripe
  stripe.value = await loadStripe(props.stripeKey);
  const elements = stripe.value.elements();
  cardElement.value = elements.create('card');
  cardElement.value.mount('#card-element');
});

const processStripePayment = async () => {
  processing.value = true;
  try {
    const { error, paymentMethod } = await stripe.value.createPaymentMethod({
      type: 'card',
      card: cardElement.value,
    });

    if (error) {
      throw new Error(error.message);
    }

    stripeForm.payment_method = paymentMethod.id;
    await stripeForm.post(route('payments.stripe', props.asset.id), {
      onSuccess: () => {
        window.location.href = route('payments.success', props.asset.id);
      },
      onError: (errors) => {
        alert('Payment failed: ' + Object.values(errors).join('\n'));
      },
    });
  } catch (error) {
    alert('Payment failed: ' + error.message);
  } finally {
    processing.value = false;
  }
};

const processMpesaPayment = async () => {
  processing.value = true;
  mpesaForm.phone = phone.value;
  
  try {
    await mpesaForm.post(route('payments.mpesa', props.asset.id), {
      onSuccess: () => {
        window.location.href = route('payments.status', props.asset.id);
      },
      onError: (errors) => {
        alert('Payment failed: ' + Object.values(errors).join('\n'));
      },
    });
  } catch (error) {
    alert('Payment failed: ' + error.message);
  } finally {
    processing.value = false;
  }
};
</script> 