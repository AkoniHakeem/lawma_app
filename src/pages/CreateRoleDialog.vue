<template>
  <q-card style="min-width: 500px">
    <q-card-section>
      <div class="text-h6">Create New Role</div>
    </q-card-section>

    <q-card-section>
      <q-form @submit="createRole" class="q-gutter-md">
        <q-input
          v-model="form.displayName"
          label="Display Name *"
          outlined
          :rules="[(val) => !!val || 'Display name is required']"
        />

        <q-input
          v-model="form.name"
          label="Role Name (Internal) *"
          outlined
          hint="Lowercase, no spaces (e.g., custom_billing_officer)"
          :rules="[
            (val) => !!val || 'Role name is required',
            (val) =>
              /^[a-z_]+$/.test(val) ||
              'Only lowercase letters and underscores allowed',
          ]"
        />

        <q-input
          v-model="form.description"
          label="Description"
          outlined
          type="textarea"
          rows="3"
        />

        <div>
          <div class="text-subtitle2 q-mb-md">Permissions:</div>
          <div class="row q-col-gutter-sm">
            <div
              v-for="category in permissionCategories"
              :key="category"
              class="col-12 col-md-6"
            >
              <q-expansion-item
                :label="formatCategoryName(category)"
                icon="security"
                header-class="text-primary"
              >
                <div class="q-pa-md">
                  <q-option-group
                    v-model="form.permissionIds"
                    :options="getPermissionsByCategory(category)"
                    type="checkbox"
                    color="primary"
                  />
                </div>
              </q-expansion-item>
            </div>
          </div>
        </div>
      </q-form>
    </q-card-section>

    <q-card-actions align="right">
      <q-btn flat label="Cancel" @click="$emit('cancel')" />
      <q-btn
        color="primary"
        label="Create Role"
        :loading="loading"
        @click="createRole"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRbacStore } from 'src/stores/rbac-store';
import { useQuasar } from 'quasar';

// Emits
const emit = defineEmits<{
  created: [];
  cancel: [];
}>();

// Composables
const rbacStore = useRbacStore();
const $q = useQuasar();

// State
const loading = ref(false);
const form = ref({
  displayName: '',
  name: '',
  description: '',
  permissionIds: [] as string[],
});

// Computed
const permissionCategories = computed(() => {
  const categories = new Set(
    rbacStore.availablePermissions.map((p) => p.category)
  );
  return Array.from(categories).sort();
});

// Methods
function formatCategoryName(category: string): string {
  return category
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getPermissionsByCategory(category: string) {
  return rbacStore.availablePermissions
    .filter((p) => p.category === category)
    .map((p) => ({
      label: p.displayName,
      value: p.id,
    }));
}

async function createRole() {
  if (!form.value.displayName || !form.value.name) {
    $q.notify({
      type: 'negative',
      message: 'Please fill in required fields',
    });
    return;
  }

  loading.value = true;

  try {
    await rbacStore.createRole({
      name: form.value.name,
      displayName: form.value.displayName,
      description: form.value.description || undefined,
      permissionIds: form.value.permissionIds,
    });

    $q.notify({
      type: 'positive',
      message: 'Role created successfully',
    });

    emit('created');
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Failed to create role',
    });
  } finally {
    loading.value = false;
  }
}

// Lifecycle
onMounted(() => {
  if (rbacStore.availablePermissions.length === 0) {
    rbacStore.loadPermissions();
  }
});
</script>
