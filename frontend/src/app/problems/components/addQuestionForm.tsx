"use client"
import { useEffect, useState } from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm } from "react-hook-form"
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
import { Label } from "@/components/ui/label"

const questionServiceBaseUrl = process.env.NEXT_PUBLIC_QUESTION_SERVICE_URL;

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
  testCases: z.array(
    z.object({
      input: singleQuoteStringSchema,
      expected: singleQuoteStringSchema,
    })
  ).min(1, { message: "At least one test case is required." })
})

interface AddQuestionFormProps {
  onClose: () => void; // Receive the onClose function as a prop
  refetch: () => void;
}

const AddQuestionForm: React.FC<AddQuestionFormProps> = ({ onClose, refetch }) => {
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

  // to update if we want to include more categories
  const categories = ["Strings", "Algorithms", "Data Structures", "Bit Manipulation", "Recursion", "Databases", "Arrays", "Brainteaser", "Dynamic Programming"]

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

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "testCases",
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    let hasError = false;
    const parsedValues = {
      ...values,
      testCases: values.testCases.map((testCase) => ({
        input: testCase.input,
        expected: testCase.expected,
      })),
    }

    console.log(values)
    if (values.categories) {
      values.categories.sort();
    }
    try {
      const response = await fetch(`${questionServiceBaseUrl}/add-question`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(parsedValues)
      });

      if (response.ok) {
        // handle successful add
        console.log("ok");
      } else {
        hasError = true;
        const errorData = await response.json()
        setError(errorData.message);
      }
    } catch (err) {
      // handle error we can decide later
      console.log("error", err);
    } finally {
        if (!hasError) {
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
                        <Textarea placeholder="Output" {...field} className="mt-2" />
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
            <Button type="button" onClick={() => append({ input: '', expected: '' })}>
              + Add Test Case
            </Button>
          </div>
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