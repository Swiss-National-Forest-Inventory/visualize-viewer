/**
 * A service class responsible for managing a stepper component (multi-step UI).
 * It provides methods to change the active step, navigate to the next or previous step,
 * and handle button states accordingly.
 */
export class StepperService {
  /**
   * An array representing the available steps.
   * @type {number[]}
   */
  steps = [1, 2, 3, 4];

  /**
   * Changes the active step to the specified next step.
   * It updates CSS classes for step indicators and the step content sections
   * based on the new active step.
   * @param {number} nextStep - The step number to change to.
   * @returns {void}
   */
  changeStep = (nextStep) => {
    this.steps.forEach((step) => {
      ['step-indicator', 'step'].forEach((type) =>
          document.getElementById(`${type}-${step}`).classList.toggle(
              type === 'step-indicator' ? 'active' : 'in-active',
              (type === 'step-indicator') ===
              (`${type}-${step}` === `${type}-${nextStep}`),
          ),
      );
    });
    this.updateStepperButton(nextStep);
  };

  /**
   * Moves to the next step if possible.
   * @returns {void}
   */
  onNextStep = () => {
    const currentStepNumber = this.getActiveStep();
    if (currentStepNumber < this.steps.length) {
      this.changeStep(currentStepNumber + 1);
    }
  };

  /**
   * Moves to the previous step if possible.
   * @returns {void}
   */
  onLastStep = () => {
    const currentStepNumber = this.getActiveStep();
    if (currentStepNumber > 1) {
      this.changeStep(currentStepNumber - 1);
    }
  };

  /**
   * Retrieves the current active step by querying the DOM for the `.step.active` element.
   * @returns {number} The number of the currently active step.
   */
  getActiveStep() {
    const activeStep = document.querySelector(
        '.ui.vertical.steps .step.active',
    );
    const currentStepNumber = parseInt(activeStep.id.split('-').pop(), 10);
    return currentStepNumber;
  }

  /**
   * Updates the state (enabled/disabled) of the step navigation buttons (Next, Previous)
   * based on the current step.
   * @param {number} currentStep - The step that is currently active.
   * @returns {void}
   */
  updateStepperButton = (currentStep) => {
    // Disable or enable buttons based on the step
    const lastButton = document.getElementById('last-button');
    const nextButton = document.getElementById('next-button');
    lastButton.classList.toggle('disabled', currentStep === 1);
    nextButton.classList.toggle('disabled', Number(currentStep) === this.steps.length);
  };
}
