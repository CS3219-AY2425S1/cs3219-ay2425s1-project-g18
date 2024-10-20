import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog"
  import { Button } from "@/components/ui/button"
   

interface DeleteQuestionAlertDialogProps {
    questionId: number,
    onClose: () => void, // Receive the onClose function as a prop
    refetch: () => void;
}
const DeleteQuestionAlertDialog: React.FC<DeleteQuestionAlertDialogProps> = ({ questionId, onClose, refetch }) => {

        async function onConfirm() {
            try {
                const response = await fetch(`http://localhost:5001/delete-question/${questionId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    console.log("ok");
                }
            } catch(err) {
                console.log("error", err);
            } finally {
                refetch();
                onClose();
            }
        }


    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <div className="flex space-x-4 justify-end">
            <Button onClick={onClose}>Cancel</Button>
            <Button variant="destructive">Delete Question</Button>
          </div>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the selected question.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-700" onClick={onConfirm}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }


export default DeleteQuestionAlertDialog;