import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog";

const Modal = ({ isOpen, onClose, title, description, children, size = "default" }) => {
  const getSizeClass = () => {
    switch (size) {
      case "sm":
        return "sm:max-w-[400px]";
      case "lg":
        return "sm:max-w-[800px]";
      case "xl":
        return "sm:max-w-[1200px]";
      case "full":
        return "sm:max-w-[95vw]";
      default:
        return "sm:max-w-[500px]";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${getSizeClass()} max-h-[90vh] overflow-y-auto`}>
        {(title || description) && (
          <DialogHeader className="pb-4 border-b border-gray-200 dark:border-gray-700">
            {title && (
              <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                {title}
              </DialogTitle>
            )}
            {description && (
              <DialogDescription className="text-gray-600 dark:text-gray-400">
                {description}
              </DialogDescription>
            )}
          </DialogHeader>
        )}
        {children}
      </DialogContent>
    </Dialog>
  );
};

const ModalBody = ({ children }) => {
  return <div className="py-4">{children}</div>;
};

const ModalFooter = ({ children }) => {
  return (
    <DialogFooter className="pt-4 border-t border-gray-200 dark:border-gray-700">
      {children}
    </DialogFooter>
  );
};

export default Modal;
export { ModalBody, ModalFooter };