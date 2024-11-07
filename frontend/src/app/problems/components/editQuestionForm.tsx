"use client" 
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
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

const singleQuoteStringSchema = z
  .string()
  .min(1, { message: "Input is required." }) // Use min() first
  .refine(
    (val) => !val.includes('"'), // Check that the string does not contain double quotes
    {
      message: 'String must not contain double quotation marks ("). Use single quotation marks (\') instead.',
    }
  );

const formSchema = z.object({
  title: z.string().optional(),
  difficulty: z.enum(["Easy", "Medium", "Hard"]).optional(),
  categories: z.array(z.string()).optional(),
  description: z.string().optional(),
  testCases: z.array(
    z.object({
      input: singleQuoteStringSchema,
      expected: singleQuoteStringSchema,
    })
  ).min(1, { message: "At least one test case is required." })
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
          description: "",
          testCases: []
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
              testCases: data[0].testCases,
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
      const categories = ["Strings", "Algorithms", "Data Structures", "Bit Manipulation", "Recursion", "Databases", "Arrays", "Brainteaser", "Dynamic Programming"]

      const handleCategoryToggle = (category: string) => {
        const currentCategories = form.getValues('categories');
        let newCategories: string[];

        if (currentCategories!.includes(category)) {
          newCategories = currentCategories!.filter(cat => cat !== category);
        } else {
          newCategories = [...currentCategories!, category];
        }

        form.setValue('categories', newCategories, { shouldDirty: true });
      };

      const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "testCases",
      });

      

      // 2. Define a submit handler.
      async function onSubmit(values: z.infer<typeof formSchema>) {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        console.log("val", values)

        var hasError = false;
        const parsedValues = {
          ...values,
          testCases: values.testCases.map((testCase) => ({
            input: testCase.input,
            expected: testCase.expected,
          })),
        }
        
        try {
            if (!isDirty) {
              hasError = true;
              setError('At least one field should be edited.');
              return;
            }
            setError('');
            const updatedFields: any = {}

            if (dirtyFields.title) {
              updatedFields.title = parsedValues.title;
            }

            if (dirtyFields.description) {
              updatedFields.description = parsedValues.description;
            }

            if (dirtyFields.categories) {
              parsedValues.categories!.sort();
              updatedFields.categories = parsedValues.categories;
            }

            if (dirtyFields.difficulty) {
              updatedFields.difficulty = parsedValues.difficulty;
            }

            if (dirtyFields.testCases) {
              updatedFields.testCases = parsedValues.testCases;
            }
            
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
        <div className="flex justify-center max-h-[80vh] overflow-y-auto">
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
            <div className="space-y-4">
              <Label className="text-lg font-semibold">Test Cases</Label>
              {fields.map((field, index) => (
                <div key={field.id} className="space-y-2 border p-4 rounded-md mb-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-md font-medium">Test Case {index + 1}</Label>
                    <Button variant="destructive" size="sm" onClick={() => remove(index)}>
                      -
                    </Button>
                  </div>
                  <FormField
                    control={form.control}
                    name={`testCases.${index}.input`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea placeholder="Input" {...field} className="mt-1" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`testCases.${index}.expected`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea placeholder="Expected Output" {...field} className="mt-2" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
              {/* Render validation message for empty test cases */}
              {form.formState.errors.testCases && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.testCases.message}
                </p>
              )}
              <Button type="button" onClick={() => append({ input: "", expected: "" })}>
                + Add Test Case
              </Button>
            </div>
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