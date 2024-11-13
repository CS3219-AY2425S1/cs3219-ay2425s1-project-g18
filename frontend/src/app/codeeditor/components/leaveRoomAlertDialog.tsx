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
   

interface LeaveRoomAlertDialogProps {
    roomId: string,
    onClose: () => void,
    handleLeaveRoomSuccess: () => void
}

const collabServiceBaseUrl = process.env.NEXT_PUBLIC_CODE_COLLAB_URL;

const LeaveRoomAlertDialog: React.FC<LeaveRoomAlertDialogProps> = ({ roomId, onClose, handleLeaveRoomSuccess }) => {

         

        async function onConfirm() {
            try {
                const response = await fetch(`${collabServiceBaseUrl}/delete-room?roomId=${roomId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                    
                });
                if (response.ok || response.status == 404) {
                    console.log("Left room successfully");
                    handleLeaveRoomSuccess();
                }
            } catch(err) {
                console.log("Error leaving room", err);
            } finally {
                onClose();
            }
        }


    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <div className="flex space-x-4 justify-end">
            <Button onClick={onClose}>Cancel</Button>
            <Button variant="destructive">Proceed to leave Room</Button>
          </div>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>You are about to leave the collaborative space.</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure? You will not be able to reenter this room.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-700" onClick={onConfirm}>Leave Room</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }


export default LeaveRoomAlertDialog;