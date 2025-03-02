import React,{useForm} from "react";

function ClassWork() {

  const { register, handleSubmit } = useForm();

  const submit = (data) => {
    console.log(data);

    // multipart form data to send the heavier files    
    const formData = new FormData();

    // data sent is shown in devtools/network - payload
    formData.append("name", data?.name)
    formData.append("age", data?.age)
    formData.append("file", data?.image[0])

  };
  return (
    <div>
      <form onSubmit={handleSubmit(submit)}>
        <div></div>
        <div></div>

        <div>
            <label htmlFor="">
                <input type="file" {...register(image)} /> to design this, use useRef
            </label>
        </div>
      </form>
    </div>
  );
}

export default ClassWork;
