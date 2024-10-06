"use client"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Textarea } from "@/components/ui/textarea"

const formSchema = z.object({
  title: z.string().min(1, {
    message: "Title must not be blank.",
  }),
  difficulty: z.enum(["Easy", "Medium", "Hard"], {
    errorMap: () => ({ message: "Please select a difficulty level." }),
  }),
  categories: z.array(z.string()).optional(),
  description: z.string().min(1, {
    message: "Description must not be blank.",
  }),

})

interface AddQuestionFormProps {
  onClose: () => void; // Receive the onClose function as a prop
  refetch: () => void;
}

const AddQuestionForm: React.FC<AddQuestionFormProps> = ({ onClose, refetch }) => {

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      difficulty: undefined,
      categories: [],
      description: ""
    },
  })

  // to update if we want to include more categories
  const categories = ["Strings", "Algorithms", "Data Structures", "Bit Manipulation", "Recursion", "Databases", "Arrays", "Brainteaser"]

  const handleCategoryToggle = (category: string) => {
    const currentCategories = form.getValues('categories');

    if (currentCategories!.includes(category)) {
      form.setValue('categories', currentCategories!.filter(cat => cat !== category));
      console.log('x')
    } else {
      form.setValue('categories', [...currentCategories!, category]);
      console.log('y')
    }
  };


  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values)
    if (values.categories) {
      values.categories.sort();
    }
    try {
      const response = await fetch('http://localhost:5001/add-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(values)
      });

      if (response.ok) {
        // handle successful add
        console.log("ok");
      }
    } catch (err) {
      // handle error we can decide later
      console.log("error", err);
    } finally {
      refetch();
      onClose();
    }
  }


  return (
    <div className="flex justify-center">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-1/2">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="Title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="difficulty"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value} >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="categories"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="space-y-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="secondary">Select Categories</Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56">
                        <DropdownMenuLabel>Categories</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {categories.map(category => (
                          <DropdownMenuCheckboxItem
                            key={category}
                            checked={form.watch('categories')!.includes(category)}
                            onCheckedChange={() => handleCategoryToggle(category)}
                          >
                            {category}
                          </DropdownMenuCheckboxItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <div className="flex flex-wrap gap-2">
                      {form.watch('categories')!.map((selectedCategory) => (
                        <span
                          key={selectedCategory}
                          className="bg-violet-200 text-violet-900 px-3 py-1 rounded-full text-sm"
                        >
                          {selectedCategory}
                        </span>
                      ))}
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea className="h-40" placeholder="Description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end w-full space-x-2">
            <Button className="bg-gray-300 text-black hover:bg-gray-400" type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit">Submit</Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
export default AddQuestionForm;