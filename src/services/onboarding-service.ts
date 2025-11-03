import { api } from 'src/boot/axios';

export interface WasteOperator {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  hasUploadedData?: boolean;
  dataUploadDate?: string;
}

export interface OnboardingState {
  isRegistered: boolean;
  wasteOperator?: WasteOperator;
  hasUploadedData: boolean;
  currentStep: 'register' | 'data-upload' | 'summary';
}

export class OnboardingService {
  private static STORAGE_KEY = 'wastepro_onboarding_state';

  /**
   * Check if user email is already registered as a waste operator
   */
  static async checkExistingRegistration(
    email: string
  ): Promise<OnboardingState> {
    try {
      // Use API directly to check for existing waste operator
      console.log('Checking registration for email:', email);
      const response = await api.get(
        `/onboarding/check-operator/${encodeURIComponent(email)}`
      );
      console.log('API response:', response);
      console.log('Response data:', response.data);
      const wasteOperator = response.data;

      if (wasteOperator) {
        // Check if data has been uploaded
        const hasUploadedData = await this.checkDataUploadStatus(
          wasteOperator.id
        );

        const state: OnboardingState = {
          isRegistered: true,
          wasteOperator: wasteOperator,
          hasUploadedData: hasUploadedData,
          currentStep: hasUploadedData ? 'summary' : 'data-upload',
        };

        this.saveOnboardingState(state);
        return state;
      } else {
        return {
          isRegistered: false,
          wasteOperator: undefined,
          hasUploadedData: false,
          currentStep: 'register',
        };
      }
    } catch (error: unknown) {
      // If API call fails (404, etc.), assume not registered
      console.error('Error checking registration:', error);
      return {
        isRegistered: false,
        wasteOperator: undefined,
        hasUploadedData: false,
        currentStep: 'register',
      };
    }
  }

  /**
   * Save onboarding state to local storage
   */
  static saveOnboardingState(state: OnboardingState) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving onboarding state:', error);
    }
  }

  /**
   * Get onboarding state from local storage
   */
  static getOnboardingState(): OnboardingState | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error getting onboarding state:', error);
      return null;
    }
  }

  /**
   * Clear onboarding state
   */
  static clearOnboardingState() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing onboarding state:', error);
    }
  }

  /**
   * Check if operator has already uploaded data
   */
  static async checkDataUploadStatus(
    wasteOperatorId: string
  ): Promise<boolean> {
    try {
      const response = await api.get(
        `/onboarding/import-summary/${wasteOperatorId}`
      );
      const summary = response.data.data;

      // If we get a successful response with data, it means data was uploaded
      return summary && (summary.totalRecords > 0 || summary.validRecords > 0);
    } catch (error) {
      // If 404 or other error, assume no data uploaded yet
      return false;
    }
  }

  /**
   * Update onboarding state after data upload
   */
  static updateDataUploadStatus(wasteOperatorId: string, uploaded: boolean) {
    const state = this.getOnboardingState();
    if (state && state.wasteOperator?.id === wasteOperatorId) {
      state.hasUploadedData = uploaded;
      state.wasteOperator.hasUploadedData = uploaded;
      if (uploaded) {
        state.wasteOperator.dataUploadDate = new Date().toISOString();
      }
      this.saveOnboardingState(state);
    }
  }
}
