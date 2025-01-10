import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Field {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select';
  options?: { value: string; label: string }[];
  validation?: z.ZodTypeAny;
  defaultValue?: any; // Add defaultValue to the Field interface
}

interface DynamicFormProps {
  fields: Field[];
  onSubmit: (data: any) => void;
}

export function DynamicForm({ fields, onSubmit, defaultValues, onDelete }: DynamicFormProps) {
  const formSchema = z.object(
    fields.reduce((acc, field) => {
      acc[field.name] = field.validation || z.string();
      return acc;
    }, {} as Record<string, z.ZodTypeAny>)
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {}, // Provide default values here
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {fields.map((field) => (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <FormControl>
                  {field.type === 'select' ? (
                    <Select key={field.name} onValueChange={formField.onChange} defaultValue={formField.name}>
                      <SelectTrigger>
                        <SelectValue placeholder={`Select ${field.label}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options?.map((option) => (
                          <SelectItem key={option.value} value={option.label}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input type={field.type} {...formField} />
                  )}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
         <div className="flex gap-4">
          <Button type="submit">
            {defaultValues ? 'Update' : 'Submit'}
          </Button>
          {defaultValues && onDelete && ( // Only show Delete button in Edit mode
            <Button
              type="button"
              variant="destructive"
              onClick={onDelete}
              className='hover:bg-red-700'
            >
              Delete
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}