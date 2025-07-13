import { reactive, ref, computed } from 'vue';
import ServicedClientSigninModel from 'src/models/ServicedClientSignin.model';
import { validate } from 'class-validator';

export function useServicedClientSigninViewModel() {
  const model = reactive(new ServicedClientSigninModel());
  const errors = ref<Record<string, string[]>>({});

  async function validateField(field: keyof ServicedClientSigninModel) {
    const validationErrors = await validate(model);
    errors.value = {};
    validationErrors.forEach((err) => {
      if (err.constraints) {
        errors.value[err.property] = Object.values(err.constraints);
      }
    });
    return errors.value[field]?.[0] || true;
  }

  const isValid = computed(() => {
    return (
      model.propertyCode.length > 0 && /^\d{10,15}$/.test(model.phoneNumber)
    );
  });

  return {
    model,
    errors,
    validateField,
    isValid,
  };
}
