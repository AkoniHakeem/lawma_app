<template>
  <q-card style="min-width: 500px">
    <q-card-section>
      <div class="text-h6">Edit User Roles</div>
      <p class="text-grey-6">
        {{ user.firstName }} {{ user.lastName }} ({{ user.email }})
      </p>
    </q-card-section>

    <q-card-section>
      <div class="text-subtitle2 q-mb-md">Current Roles:</div>
      <div v-if="user.roles.length > 0" class="q-mb-md">
        <q-chip
          v-for="role in user.roles"
          :key="role.id"
          :color="getChipColor(role.name)"
          text-color="white"
          size="sm"
          class="q-mr-xs q-mb-xs"
        >
          {{ role.displayName }}
          <q-tooltip
            >Assigned:
            {{ new Date(role.assignedAt).toLocaleDateString() }}</q-tooltip
          >
        </q-chip>
      </div>
      <div v-else class="text-grey-6 q-mb-md">No roles assigned</div>

      <div class="text-subtitle2 q-mb-md">Assign New Roles:</div>
      <q-option-group
        v-model="selectedRoleIds"
        :options="roleOptions"
        type="checkbox"
        color="primary"
      />
    </q-card-section>

    <q-card-actions align="right">
      <q-btn flat label="Cancel" @click="$emit('cancel')" />
      <q-btn
        color="primary"
        label="Update Roles"
        :loading="loading"
        @click="updateRoles"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRbacStore } from 'src/stores/rbac-store';
import { EntityUser } from 'src/services/rbac.service';
import { useQuasar } from 'quasar';

// Props
const props = defineProps<{
  user: EntityUser;
  profileType: 'entity_user_profile' | 'entity_subscriber_profile';
}>();

// Emits
const emit = defineEmits<{
  updated: [];
  cancel: [];
}>();

// Composables
const rbacStore = useRbacStore();
const $q = useQuasar();

// State
const loading = ref(false);
const selectedRoleIds = ref<string[]>([]);

// Computed
const roleOptions = computed(() => {
  return rbacStore.availableRoles.map((role) => ({
    label: `${role.displayName}${
      role.description ? ` - ${role.description}` : ''
    }`,
    value: role.id,
    disable: role.isSystemRole && !rbacStore.isSuperAdmin,
  }));
});

// Methods
function getChipColor(roleName: string): string {
  const colorMap: Record<string, string> = {
    super_admin: 'red',
    admin: 'purple',
    billing_officer: 'blue',
    field_officer: 'green',
    customer_service: 'orange',
    viewer: 'grey',
    customer: 'teal',
  };
  return colorMap[roleName] || 'primary';
}

async function updateRoles() {
  loading.value = true;

  try {
    await rbacStore.updateUserRoles(
      props.user.id,
      selectedRoleIds.value,
      props.profileType
    );

    $q.notify({
      type: 'positive',
      message: 'User roles updated successfully',
    });

    emit('updated');
  } catch (error: any) {
    $q.notify({
      type: 'negative',
      message: error.message || 'Failed to update user roles',
    });
  } finally {
    loading.value = false;
  }
}

// Lifecycle
onMounted(() => {
  // Initialize with current user roles
  selectedRoleIds.value = props.user.roles.map((role) => role.id);

  // Load roles if not already loaded
  if (rbacStore.availableRoles.length === 0) {
    rbacStore.loadRoles();
  }
});
</script>
