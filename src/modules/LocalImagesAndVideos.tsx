import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion"
import shareDilogStyles from "../Styling/ShareDilog.module.css";
import React from "react";


interface BoxPayload {
    image: string;
    setCloseImage : React.Dispatch<React.SetStateAction<boolean>>;
}


function LocalImagesAndVideos({ image  ,setCloseImage}: BoxPayload) {
    return (
        <div className={shareDilogStyles.blackBehindContainer}>

            <div className={shareDilogStyles.crossButton} >
                <X onClick={() => setCloseImage(prev => !prev)}/>
            </div>

            <div style={{ width: "500px", height: "700px" }}>
                <AnimatePresence>
                    {image && (
                        <motion.img
                            style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "10px" }}
                            src={image}
                            alt="enlarged"
                            initial={{ scale: 0.3, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.3, opacity: 0 }}
                            transition={{ duration: 0.4 }}
                            onClick={(e) => e.stopPropagation()}
                        />
                    )}
                </AnimatePresence>
            </div>

        </div>
    )
}

export default LocalImagesAndVideos
