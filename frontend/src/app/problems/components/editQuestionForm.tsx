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
import { useEffect, useState } from "react";

const formSchema = z.object({
  title: z.string().optional(),
  difficulty: z.enum(["Easy", "Medium", "Hard"]).optional(),
  categories: z.array(z.string()).optional(),
  description: z.string().optional(),
});

interface EditQuestionFormProps {
  questionId: number,
  onClose: () => void, // Receive the onClose function as a prop
  refetch: () => void;
}

const EditQuestionForm: React.FC<EditQuestionFormProps> = ({ questionId, onClose, refetch }) => {
      const [isFormEdited, setIsFormEdited] = useState<boolean>(true);
      const [error, setError] = useState('');

      const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
          title: "",
          difficulty: undefined,
          categories: [],
          description: ""
        },
      })

      const fetchData = async () => {
        try {
          const response = await fetch(`http://localhost:5001/get-questions?questionId=${questionId}`, {
            method: 'GET',
          });

          const data = await response.json();
          
          if (response.ok) {
            form.reset({
              title: data[0].title,
              difficulty: data[0].difficulty,
              categories: data[0].categories,
              description: data[0].description,
            })
          }

        } catch (e) {
          console.error('Error fetching data:', e);
        }
      };

      useEffect(() => {
        fetchData();
      }, []);

      const { isDirty, dirtyFields } = form.formState;

      // to update if we want to include more categories
      const categories = ["Strings", "Algorithms", "Data Structures", "Bit Manipulation", "Recursion", "Databases", "Arrays", "Brainteaser"]

      const handleCategoryToggle = (category: string) => {
        const currentCategories = form.getValues('categories');
        let newCategories: string[];

        if (currentCategories!.includes(category)) {
          newCategories = currentCategories!.filter(cat => cat !== category);
          console.log('x')
        } else {
          newCategories = [...currentCategories!, category];
          console.log('y')
        }

        form.setValue('categories', newCategories, { shouldDirty: true });
      };

      // 2. Define a submit handler.
      async function onSubmit(values: z.infer<typeof formSchema>) {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        console.log("val", values)

        var hasError = false;

        try {
            if (!isDirty) {
              hasError = true;
              setError('At least one field should be edited.');
              return;
            }
            setError('');

            const updatedFields: any = {}

            if (dirtyFields.title) {
              updatedFields.title = values.title;
            }

            if (dirtyFields.description) {
              updatedFields.description = values.description;
            }

            if (dirtyFields.categories) {
              values.categories.sort();
              updatedFields.categories = values.categories;
            }

            if (dirtyFields.difficulty) {
              updatedFields.difficulty = values.difficulty;
            }

            console.log('updatedFields', updatedFields);
            
            const response = await fetch(`http://localhost:5001/edit-question/${questionId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedFields)
            });

            if (response.ok) {
              hasError = false;
              setError('');
              console.log("ok");
            } else {
              hasError = true;
              const errorData = await response.json()
              setError(errorData.message);
            }
        } catch(err) {
            // handle error we can decide later
            hasError = true;
            console.log("error", err);
        } finally {
          if (!hasError && isDirty) {
            refetch();
            onClose();
          }
        }
      }


    return (
        <div className="flex justify-center">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-1/2">
            {error && (
              <div className="p-4 text-sm text-red-700 bg-red-100 border border-red-400 rounded">
                {error}
              </div>
            )}
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
                        <Button variant="outline">Select Categories</Button>
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
                    <Textarea className="h-40" placeholder="Description" {...field}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end w-full space-x-2">
                <Button className="bg-gray-300 text-black hover:bg-gray-400" type="button" onClick={onClose}>Cancel</Button>
                <Button className="primary-color hover:bg-violet-900" type="submit">Submit</Button>
            </div>
          </form>
        </Form>
        </div>
      )
}
export default EditQuestionForm;