Install dependencies

```bash
sudo apt install pcl_tools
```

Command for convertation
```bash
pcl_convert_pcd_ascii_binary <file_in.pcd> <file_out.pcd> 0/1/2 (ascii/binary/binary_compressed) [precision (ASCII)]
```

Example
```bash
pcl_convert_pcd_ascii_binary sample.pcd sample_acsii.pcd 0
```